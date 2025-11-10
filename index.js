/* BLACKMERCHANT WhatsApp Bot */
const {
    default: ravenConnect,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    downloadContentFromMessage,
    jidDecode,
    proto
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

const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/ravenexif');
const { smsg, getBuffer } = require('./lib/ravenfunc');
const Events = require('./action/events');
const makeInMemoryStore = require('./store/store.js');

const { sessionName, session, mode, prefix, autobio, autolike, autoviewstatus, antiforeign, anticall, mycode, packname, port } = require("./set.js");

const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });
const app = express();
let lastCallMessageTime = 0;
const CALL_MESSAGE_DELAY = 5000;

// Color helper
const color = (text, col) => !col ? chalk.green(text) : chalk.keyword(col)(text);

async function downloadSession() {
    if (!fs.existsSync(path.join(__dirname, '/sessions/creds.json'))) {
        if (!session) return console.log('Please add your session to SESSION env!');
        const sessData = session.replace("BLACK MD;;;", '');
        const filer = await File.fromURL(`https://mega.nz/file/${sessData}`);
        filer.download((err, data) => {
            if (err) throw err;
            fs.writeFileSync(path.join(__dirname, '/sessions/creds.json'), data);
            console.log("Session downloaded ✅");
        });
    }
}

async function startBLACKMERCHANT() {
    await downloadSession();
    const { state, saveCreds } = await useMultiFileAuthState('./sessions/');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
    console.log(color(figlet.textSync("BLACKMERCHANT", { font: "Standard" }), "green"));

    const client = ravenConnect({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["BLACKMERCHANT", "Safari", "5.1.7"],
        auth: state,
        syncFullHistory: true
    });

    store.bind(client.ev);

    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startBLACKMERCHANT();
        } else if (connection === 'open') {
            console.log(color("✅ BLACKMERCHANT connected successfully!", "green"));

            // Auto-bio
            if (autobio === "TRUE") {
                const bios = [
                    "💀 BLACKMERCHANT 👻",
                    "😇 Dark Souls, Light Mind 🦋",
                    "🦝 Code in Dark, Speak in Light ♨️",
                    "🐺 Merchant Of Black Magic ❤️‍🔥",
                    "🦊 Death is Not The End 🍭"
                ];
                let index = 0;
                const updateBio = async () => {
                    try {
                        const date = new Date();
                        const time = date.toLocaleTimeString("en-US", { timeZone: "Africa/Nairobi", hour12: false });
                        const day = date.toLocaleString("en-US", { weekday: "long", timeZone: "Africa/Nairobi" });
                        const bioText = `⚔️ BLACKMERCHANT | ⌚️ ${time} | 🗓️ ${day}\n${bios[index]}`;
                        await client.updateProfileStatus(bioText);
                        index = (index + 1) % bios.length;
                    } catch (err) {
                        console.log("Bio skipped: connection not ready");
                    }
                };
                updateBio();
                setInterval(updateBio, 30 * 60 * 1000);
            }
        }
    });

    client.ev.on("creds.update", saveCreds);

    // Messages
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            let mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;

            if (autoviewstatus === 'TRUE' && mek.key.remoteJid === "status@broadcast") {
                client.readMessages([mek.key]);
            }

            if (autolike === 'TRUE' && mek.key.remoteJid === "status@broadcast") {
                const nickk = await client.decodeJid(client.user.id);
                const emojis = ["🦋", "🐀", "❤️‍🔥", "❤️", "💖"];
                let reactionEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                if (!mek.status) {
                    await client.sendMessage(
                        mek.key.remoteJid,
                        { react: { key: mek.key, text: reactionEmoji } },
                        { statusJidList: [mek.key.participant, nickk] }
                    );
                }
            }

            // Call the main command handler
            let m = smsg(client, mek, store);
            const raven = require("./blacks");
            raven(client, m, chatUpdate, store);

        } catch (err) {
            console.log(err);
        }
    });

    // Anti-Foreign Join
    client.ev.on("group-participants.update", async (update) => {
        if (antiforeign === 'TRUE' && update.action === "add") {
            for (let participant of update.participants) {
                const jid = client.decodeJid(participant);
                const phoneNumber = jid.split("@")[0];
                if (!phoneNumber.startsWith(mycode)) {
                    await client.sendMessage(update.id, {
                        text: "Your Country code is not allowed in this group! 🚫",
                        mentions: [jid]
                    });
                    await client.groupParticipantsUpdate(update.id, [jid], "remove");
                    console.log(`Removed ${jid} from ${update.id} (foreign)`);
                }
            }
        }
        Events(client, update);
    });

    // Anti-Call
    client.ev.on('call', async (callData) => {
        if (anticall === 'TRUE') {
            const callId = callData[0].id;
            const callerId = callData[0].from;

            await client.rejectCall(callId, callerId);

            const currentTime = Date.now();
            if (currentTime - lastCallMessageTime >= CALL_MESSAGE_DELAY) {
                await client.sendMessage(callerId, {
                    text: "🚫 Strict Anti-Call is active! Only messages allowed."
                });
                lastCallMessageTime = currentTime;
            } else {
                console.log('Skipped call message to prevent spam');
            }
        }
    });

    client.public = true;
    client.serializeM = (m) => smsg(client, m, store);

    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
    };

    client.ev.on("contacts.update", (update) => {
        for (let contact of update) {
            let id = client.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });

    // Server for Web Panel
    app.use(express.static("pixel"));
    app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
    app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

    return client;
}

// Start the bot
startBLACKMERCHANT();

// Hot reload index.js
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update detected: ${__filename}`));
    delete require.cache[file];
    require(file);
});