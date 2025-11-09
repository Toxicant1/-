/* BLACKMERCHANT index.js */
const {
  default: ravenConnect,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  jidDecode,
  proto,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const express = require("express");
const chalk = require("chalk");
const FileType = require("file-type");
const figlet = require("figlet");
const { File } = require("megajs");
const app = express();
let lastTextTime = 0;
const messageDelay = 5000;

const Events = require('./action/events');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/ravenexif');
const { smsg } = require('./lib/ravenfunc');
const { sessionName, session, mode, prefix, autobio, autolike, port, mycode, anticall, antiforeign, packname, autoviewstatus } = require("./set.js");
const makeInMemoryStore = require('./store/store.js'); 
const store = makeInMemoryStore({ logger: pino({ level: 'silent' }).child({ stream: 'store' }) });

const color = (text, clr) => !clr ? chalk.green(text) : chalk.keyword(clr)(text);

async function authentication() {
    if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
        if (!session) return console.log('Please add your session to SESSION env!!');
        const sessdata = session.replace("BLACK MD;;;", '');
        const filer = await File.fromURL(`https://mega.nz/file/${sessdata}`);
        filer.download((err, data) => {
            if (err) throw err;
            fs.writeFileSync(__dirname + '/sessions/creds.json', data);
            console.log("Session downloaded successfully ✅");
            console.log("Connecting to WhatsApp ⏳, Hold on...");
        });
    }
}

async function startBLACKMERCHANT() {
    await authentication();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
    console.log(color(figlet.textSync("BLACKMERCHANT", { font: "Standard" }), "green"));

    const client = ravenConnect({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["BLACKMERCHANT - AI", "Safari", "5.1.7"],
        auth: state,
        syncFullHistory: true,
    });

    store.bind(client.ev);

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) startBLACKMERCHANT();
        } else if (connection === 'open') {
            console.log(color("Congrats, BLACKMERCHANT has successfully connected ✅", "green"));
            console.log(color("Text the bot number with menu to check my commands", "yellow"));

            const Texxt = `✅ 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 » »【BLACKMERCHANT】\n👥 𝗠𝗼𝗱𝗲 »» ${mode}\n👤 𝗣𝗿𝗲𝗳𝗶𝘅 »» ${prefix}`;
            client.sendMessage(client.user.id, { text: Texxt });
        }
    });

    client.ev.on("creds.update", saveCreds);

    /* ⚔️ Auto Bio */
    if (autobio === "TRUE") {
        const bios = [
            "💀 BLACKMERCHANT 👻",
            "😇 Dark Souls, Light Mind 🦋",
            "🦝 Code in Dark, Speak in Light ♨️",
            "🐺 Merchant Of Black Magic ❤️‍🔥",
            "🦊 Death is Not The End 🍭"
        ];
        let index = 0;
        const updateBio = () => {
            const date = new Date();
            const time = date.toLocaleTimeString("en-US", { timeZone: "Africa/Nairobi", hour12: false });
            const day = date.toLocaleString("en-US", { weekday: "long", timeZone: "Africa/Nairobi" });
            const bioText = `⚔️ BLACKMERCHANT | ⌚️ ${time} | 🗓️ ${day}\n${bios[index]}`;
            client.updateProfileStatus(bioText);
            index = (index + 1) % bios.length;
        };
        updateBio();
        setInterval(updateBio, 30 * 60 * 1000);
    }

    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            let mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;

            if (autoviewstatus === 'TRUE' && mek.key.remoteJid === "status@broadcast") {
                client.readMessages([mek.key]);
            }

            // Auto Like
            if (autolike === 'TRUE' && mek.key.remoteJid === "status@broadcast") {
                const emojis = ["🦋", "🐀", "❤️‍🔥", "❤️", "💖", "💝", "❤️‍🩹", "💞"];
                let emojiIndex = 0;
                if (!mek.status) {
                    const reactionEmoji = emojis[emojiIndex];
                    emojiIndex = (emojiIndex + 1) % emojis.length;
                    console.log(`💫 Reacting with: ${reactionEmoji} to ${mek.key.remoteJid}`);
                    await client.sendMessage(mek.key.remoteJid, { react: { key: mek.key, text: reactionEmoji } }, { statusJidList: [mek.key.participant, client.user.id] });
                }
            }

            if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
            let m = smsg(client, mek, store);
            const raven = require("./blacks");
            raven(client, m, chatUpdate, store);

        } catch (err) {
            console.log(err);
        }
    });

    // Anti-Call Strict
    client.ev.on('call', async (callData) => {
        if (anticall === 'TRUE') {
            const callId = callData[0].id;
            const callerId = callData[0].from;
            await client.rejectCall(callId, callerId);

            const now = Date.now();
            if (now - lastTextTime >= messageDelay) {
                await client.sendMessage(callerId, { text: "🛑 Anti-Call Active! Only text messages allowed!" });
                lastTextTime = now;
            } else {
                console.log('Skipped anti-call message to prevent spam');
            }
        }
    });

    client.ev.on("group-participants.update", async (update) => {
        if (antiforeign === 'TRUE' && update.action === "add") {
            for (let participant of update.participants) {
                const jid = client.decodeJid(participant);
                const phoneNumber = jid.split("@")[0];
                if (!phoneNumber.startsWith(mycode)) {
                    await client.sendMessage(update.id, { text: "🚫 Your country code is not allowed in this group!", mentions: [jid] });
                    await client.groupParticipantsUpdate(update.id, [jid], "remove");
                    console.log(`Removed ${jid} from ${update.id} (foreign number)`);
                }
            }
        }
        Events(client, update);
    });

    // Helpers
    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
    };

    client.public = true;
    client.serializeM = (m) => smsg(client, m, store);

    return client;
}

// Express server
app.use(express.static("pixel"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

startBLACKMERCHANT();

// Auto-reload
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update detected: ${__filename}`));
    delete require.cache[file];
    require(file);
});