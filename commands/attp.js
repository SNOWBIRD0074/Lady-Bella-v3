const axios = require('axios');

async function attpCommand(sock, chatId, message) {
    const userMessage = message.message.conversation || message.message.extendedTextMessage?.text || '';
    const text = userMessage.split(' ').slice(1).join(' ');

    if (!text) {
        await sock.sendMessage(chatId, { text: 'Please provide text after the .attp command.' }, { quoted: message });
        return;
    }

    try {
        // Use the API to generate animated text sticker
        const apiUrl = `https://api.lolhuman.xyz/api/attp?apikey=537f15cefff1662ac5df2935&text=${encodeURIComponent(text)}`;
        
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const stickerBuffer = Buffer.from(response.data);

        await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
            mimetype: 'image/webp',
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error generating sticker:', error);
        await sock.sendMessage(chatId, { text: 'Failed to generate the sticker. Please try again later.' }, { quoted: message });
    }
}

module.exports = attpCommand;