const os = require('os');
const settings = require('../settings.js');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days}d` : null,
        hours > 0 ? `${hours}h` : null,
        minutes > 0 ? `${minutes}m` : null,
        `${seconds}s`
    ].filter(Boolean).join(' ');
}

function getSystemStats() {
    return {
        cpuUsage: (process.cpuUsage().user / 1000 / 1000).toFixed(2),
        memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
        totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
        freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2),
        loadAvg: os.loadavg()[0].toFixed(2)
    };
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        const pingMsg = await sock.sendMessage(chatId, { text: '🏓 Pong!' });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);
        const uptime = formatTime(process.uptime());
        const stats = getSystemStats();
        const version = settings.version || '3.0.0';

        const botInfo = `
╭────────────────────────
│     BEN-𝐌𝐃 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒  
├────────────────────────
│  🚀 Response: ${ping.toString().padEnd(6)} ms
│  ⏳ Uptime:   ${uptime.padEnd(14)}
│  📦 Version:  v${version.padEnd(10)}
├──────────────────────────────
│  💾 Memory:   ${stats.memoryUsage} MB / ${stats.totalMemory} GB
│  🖥️ CPU:      ${stats.cpuUsage}% (Load: ${stats.loadAvg})
│  👥 Users:    ${global.users?.length || 0} active
╰──────────────────────────────
╭──────────────────────────────
│  🔗 GitHub:   https://github.com/SNOWBIRD0074/BEN-10-MD
│  📢 Channel:  ${settings.channelLink || 'whatsapp.com/channel/https://whatsapp.com/channel/0029Vb5nSebFy722d2NEeU3C'}
╰──────────────────────────────
`.trim();

        await sock.sendMessage(chatId, { 
            text: botInfo, 
            quoted: message,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399707841760@newsletter',
                    newsletterName: 'BEN 10 MD',
                    serverMessageId: -1
                }
            }
        });

        // Delete the initial ping message
        if (pingMsg?.key?.id) {
            await sock.sendMessage(chatId, {
                delete: {
                    id: pingMsg.key.id,
                    remoteJid: chatId,
                    fromMe: false
                }
            });
        }

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get bot status',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399707841760@newsletter',
                    newsletterName: 'BEN 10 𝐌𝐃',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = pingCommand;