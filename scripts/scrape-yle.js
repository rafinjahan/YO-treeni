const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

async function scrapeYle(url, subject, year, season) {
    console.log(`\n==========================================`);
    console.log(`🎯 TARGETING EXAM: ${subject} | ${season.toUpperCase()} ${year}`);
    console.log(`🔗 URL: ${url}`);
    console.log(`==========================================`);
    
    let html;
    try {
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
        html = res.data;
    } catch (err) {
        console.error("❌ Failed to fetch Yle URL. Are you sure it's valid? Error:", err.message);
        return;
    }

    const $ = cheerio.load(html);
    const questions = [];
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

    console.log(`\n🔍 Parsing DOM for Abitti numerical IDs...`);
    $('[id]').each((i, el) => {
        const id = $(el).attr('id');
        if (/^\d+$/.test(id)) { // Pure numeric ID signifies a Top-Level Abitti Question
            const htmlContent = $(el).html();
            
            // Extract Max Points cleanly 
            const ms = htmlContent.match(/(\d+)\s*p\./i);
            const maxPoints = ms ? parseInt(ms[1]) : 12;

            // Restructure SVGs, Images and MathML rendering logic to safely embed onto our platform
            let cleanedHTML = sanitizeYleHTML(htmlContent, baseUrl);

            questions.push({
                number: parseInt(id),
                text: cleanedHTML,
                max_points: maxPoints,
                model_answer: "Esimerkkiratkaisu puuttuu automaattisesta hakemistosta. Voit päivittää tämän manuaalisesti /admin paneelista." // Generic fallback
            });
        }
    });

    if (questions.length === 0) {
        console.log("⚠️ No numerical question boundaries found. This URL might be using a protected React Router iFrame or a PDF wrapper.");
        return;
    }
    
    console.log(`✅ Extracted ${questions.length} total questions.`);

    // Next Phase: Push to Supabase Securely!
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseKey) {
        console.error("❌ Fatal Error: Could not locate NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment setup.");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`\n☁️ Booting Supabase Pipeline to [${supabaseUrl}]...`);
    console.log(`📝 Upserting Exam Root Object...`);
    const { data: examConfig, error: examError } = await supabase
        .from('exams')
        .upsert({ subject, year: parseInt(year), season }, { onConflict: 'subject,year,season', ignoreDuplicates: false })
        .select('id')
        .single();

    if (examError || !examConfig) {
        console.error("❌ Supabase Rejected Exam Initializer:", examError);
        return;
    }

    const examId = examConfig.id;
    console.log(`✅ Exam generated under Database ID: ${examId}`);

    let added = 0;
    process.stdout.write(`⚙️ Uploading questions to DB...`);
    for (const q of questions) {
        const { error: qError } = await supabase
            .from('questions')
            .upsert({
                exam_id: examId,
                number: q.number,
                content: { text: q.text },
                max_points: q.max_points,
                model_answer: q.model_answer
            }, { onConflict: 'exam_id,number', ignoreDuplicates: false });

        if (qError) {
            console.error(`\n❌ DB Constraint Error on Q${q.number}:`, qError);
        } else {
            added++;
        }
    }

    console.log(`\n🎉 MISSION CRITICAL SUCCESS! Bound ${added} / ${questions.length} valid questions actively into Supabase.`);
}

function sanitizeYleHTML(html, baseUrl) {
    let cleaned = html;
    
    // Purge aggressive scripts and random telemetry embedded by Yle
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    
    // Purge local buttons that crash states
    cleaned = cleaned.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, "");
    
    // Dynamically replace arbitrary relative attachment links (like images masking as attachments/ratakisko.png)
    // with Absolute secure targets linking right to Yle's public CDN buffers natively.
    cleaned = cleaned.replace(/href="attachments\//g, `href="${baseUrl}attachments/`);
    cleaned = cleaned.replace(/src="attachments\//g, `src="${baseUrl}attachments/`);
    
    return cleaned;
}

const args = process.argv.slice(2);
if (args.length < 4) {
    console.log("Usage: node --env-file=.env.local scripts/scrape-yle.js <url> <subject> <year> <season>");
    console.log("Example Execution:");
    console.log("node --env-file=.env.local scripts/scrape-yle.js https://yle.fi/plus/abitreenit/2023/kevat/2023-03-22_M_fi/index.html math_long 2023 kevat");
    process.exit(1);
}

scrapeYle(args[0], args[1], args[2], args[3]);
