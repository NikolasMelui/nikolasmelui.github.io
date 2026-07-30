#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const cv = JSON.parse(fs.readFileSync(path.join(root, 'cv.json'), 'utf8'));
const readmePath = path.join(root, 'README.md');

const start = '<!-- cv:start -->';
const end = '<!-- cv:end -->';

function positions(cv) {
    return cv.work?.positions || [];
}

function formatCommunityLine(entry) {
    const title = entry.title;
    return `${title} at [${entry.org}](${entry.url})`;
}

function formatPastLine(past) {
    if (!past.length) return null;
    return (
        past
            .map((job) => `ex-${job.position} at [${job.company}](${job.url})`)
            .join(', ') + ','
    );
}

function formatFocus(current) {
  return (current?.projects || [])
    .filter((p) => p.more)
    .map((p) => {
      const label = p.title.split(/\s*[—–]\s*|:/)[0].split(/\s+-\s+/)[0].trim();
      return `[${label}](${p.more})`;
    })
    .join(', ');
}

function formatReadmeBio(cv) {
    const jobs = positions(cv);
    const current = jobs.find((w) => w.actual);
    const past = jobs.filter((w) => !w.actual);
    const focus = formatFocus(current);

    const lines = [
        'Who am I? 🤔',
        `${cv.headline} with ${cv.experience} 💪`,
        'DevOps culture addict, technology evangelist, software applications architect and lead, responsible for results 👍',
        'Open Source contributor 🌱 and IT community enthusiast 🌿, speaker at conferences and meetups 🎤,',
        formatPastLine(past),
        ...(cv.community || []).map(formatCommunityLine),
        `In love with ${cv.love.join(', ')} 😻`,
        '...',
        current &&
        `Currently working hard on ${focus} and other cool things 🔥 at [${current.company}](${current.url}) as **${current.position || cv.role}** 👷`,
        '...',
        `${cv.contacts.socials} — all socials 💬`,
        '...',
        `[CV source: cv.json](https://github.com/NikolasMelui/nikolasmelui/blob/master/cv.json) · [Site](https://nikolasmelui.github.io/)`,
        '...',
    ].filter(Boolean);

    return lines.map((line) => `${line}  `).join('\n');
}

const bio = formatReadmeBio(cv);
const block = `${start}\n${bio}\n${end}`;

let readme = fs.readFileSync(readmePath, 'utf8');

if (readme.includes(start) && readme.includes(end)) {
    readme = readme.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
} else {
    readme = `${readme.trim()}\n\n${block}\n`;
}

fs.writeFileSync(readmePath, `${readme.trim()}\n`);
console.log('README.md profile section synced from cv.json');
