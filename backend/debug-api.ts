
const fetch = require('node-fetch'); // In bun this is ignored/handled

async function main() {
    const baseUrls = [
        'http://127.0.0.1:3000/api',
        'http://127.0.0.1:3000',
        'http://localhost:3000/api',
        'http://localhost:3000'
    ];

    console.log('Starting connectivity check...');

    for (const baseUrl of baseUrls) {
        try {
            const url = `${baseUrl}/courses`;
            console.log(`Trying ${url}...`);
            const res = await fetch(url);
            console.log(`Response status: ${res.status}`);

            if (res.ok) {
                console.log(`Successfully connected to ${baseUrl}`);
                const courses = await res.json();
                console.log(`Found ${courses.length} courses.`);

                if (courses.length > 0) {
                    const courseId = courses[0].id;
                    console.log(`Fetching detail for course ${courseId}`);
                    const detailUrl = `${baseUrl}/courses/${courseId}`;
                    const detailRes = await fetch(detailUrl);
                    const detail = await detailRes.json();

                    // contentBlocks check
                    let contentFound = false;
                    const checkLesson = (l) => {
                        if (l.contentBlocks) {
                            console.log(`Lesson ${l.id} has ${l.contentBlocks.length} content blocks.`);
                            console.log('Sample block:', JSON.stringify(l.contentBlocks[0], null, 2));
                            contentFound = true;
                        } else {
                            console.log(`Lesson ${l.id} has NO contentBlocks property.`);
                        }
                    };

                    if (detail.chapters) {
                        detail.chapters.forEach(c => c.lessons.forEach(checkLesson));
                    }
                    if (detail.lessons) {
                        detail.lessons.forEach(checkLesson);
                    }

                    if (!contentFound) console.log('No content blocks found in any lesson of this course.');
                }
                return; // Exit on success
            } else {
                console.log('Request failed:', await res.text());
            }
        } catch (e) {
            console.log(`Failed to connect to ${baseUrl}: ${e.message}`);
        }
    }
    console.log('All connection attempts failed.');
}

main();
