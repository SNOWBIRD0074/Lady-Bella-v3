async function githubCommand(sock, chatId) {
    const repoInfo = `*Lady bella*

*Github:*
https://github.com/SNOWBIRD0074/BEN-10-MD

*Dont forget to star✨and fork our repo

*OUR OFFICIAL CHANNEL

https://whatsapp.com/channel/0029Vb5nSebFy722d2NEeU3C
`;

    try {
        await sock.sendMessage(chatId, {
            text: repoInfo,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399707841760@newsletter',
                    newsletterName: 'Lady bella',
                    serverMessageId: -1
                }
            }
        });
    } catch (error) {
        console.error('Error in github command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error fetching repository information.' 
        });
    }
}

module.exports = githubCommand; 