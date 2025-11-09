/* If it works, don't  Fix it */
const {
  default: ravenConnect,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  jidDecode,
  proto,
  getContentType,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require('path');
const axios = require("axios");
const express = require("express");
const chalk = require("chalk");
const FileType = require("file-type");
const figlet = require("figlet");
const { File } = require('megajs');
const app = express();
const _ = require("lodash");
let lastTextTime = 0;
const messageDelay = 5000;
const Events = require('./action/events');
const logger = pino({ level: 'silent' });
//const authentication = require('./action/auth');
const PhoneNumber = require("awesome-phonenumber");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/ravenexif');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/ravenfunc');
const { sessionName, session, mode, prefix, autobio, autolike, port, mycode, anticall, antiforeign, packname, autoviewstatus } = require("./set.js");
const makeInMemoryStore = require('./store/store.js'); 
const store = makeInMemoryStore({ logger: logger.child({ stream: 'store' }) });
//const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};

async function authentication() {
  if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if(!session) return console.log('Please add your session to SESSION env !!')
const sessdata = session.replace("BLACK MD;;;", '');
const filer = await File.fromURL(`https://mega.nz/file/${sessdata}`)
filer.download((err, data) => {
if(err) throw err
fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
console.log("Session downloaded successfully✅️")
console.log("Connecting to WhatsApp ⏳️, Hold on for 3 minutes⌚️")
})})}
}

async function startRaven() {
       await authentication();  
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  console.log(
    color(
      figlet.textSync("BLACK-MD", {
        font: "Standard",
        horizontalLayout: "default",
        vertivalLayout: "default",
        whitespaceBreak: false,
      }),
      "green"
    )
  );

  const client = ravenConnect({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["BLACK - AI", "Safari", "5.1.7"],
    auth: state,
    syncFullHistory: true,
  });

store.bind(client.ev);

let hasSentConnectedMsg = true;

client.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect } = update;

  if (connection === 'close') {
    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
    if (shouldReconnect) {
      console.log("🔁 Connection closed, reconnecting...");
      startRaven();
      hasSentConnectedMsg = false; // reset for next connection
    }
  } else if (connection === 'open' && !hasSentConnectedMsg) {
    console.log(color("⚔️ 𝔹𝕃𝔸ℂ𝕂 𝕄𝔻 has successfully connected to this server", "green"));
    console.log(color("Follow me on GitHub as 𝔹𝕃𝔸ℂ𝕂𝕀𝔼254", "red"));
    console.log(color("Text the bot number with menu to check my command list", "yellow"));

    // Auto-join group (optional)
    client.groupAcceptInvite('LDBdQY8fKbs1qkPWCTuJGX');

    // Send gothic-style message to yourself
    const gothicText = 
      `✅ 𝔹𝕃𝔸ℂ𝕂𝕄𝔻 Connected\n` +
      `👥 Mode »» ${mode}\n` +
      `👤 Prefix »» ${prefix}`;
    client.sendMessage(client.user.id, { text: gothicText });

    hasSentConnectedMsg = true; // prevent spam
  }
});

    client.ev.on("creds.update", saveCreds);

  /* ⚔️ Auto Bio Rotator — Gothic Style */
if (autobio === "TRUE") {
  const bios = [
    "💀 𝕿𝖍𝖊 𝕭𝖑𝖆𝖈𝖐 𝕸𝖊𝖗𝖈𝖍𝖆𝖓𝖙 👻",
    "😇 𝕯𝖆𝖗𝖐 𝕾𝖔𝖚𝖑𝖘, 𝕷𝖎𝖌𝖍𝖙 𝕸𝖎𝖓𝖉 🦋",
    "🦝 𝕮𝖔𝖉𝖊 𝖎𝖓 𝕯𝖆𝖗𝖐, 𝕾𝖕𝖊𝖆𝖐 𝖎𝖓 𝕷𝖎𝖌𝖍𝖙 ♨️",
    "🐺 𝕸𝖊𝖗𝖈𝖍𝖆𝖓𝖙 𝕺𝖋 𝕭𝖑𝖆𝖈𝖐 𝕸𝖆𝖌𝖎𝖈 ❤️‍🔥",
    "🦊 𝕯𝖊𝖆𝖙𝖍 𝕚𝖘 𝕹𝖔𝖙 𝕿𝖍𝖊 𝕰𝖓𝖉 🍭"
  ];

  let index = 0;

  setInterval(() => {
    const date = new Date();
    const time = date.toLocaleTimeString("en-US", {
      timeZone: "Africa/Nairobi",
      hour12: false,
    });
    const day = date.toLocaleString("en-US", {
      weekday: "long",
      timeZone: "Africa/Nairobi",
    });

    const bioText = `⚔️ 𝕭𝖑𝖆𝖈𝖐𝕸𝖊𝖗𝖈𝖍𝖆𝖓𝖙 | ⌚️ ${time} | 🗓️ ${day}\n${bios[index]}`;
    client.updateProfileStatus(bioText);
    index = (index + 1) % bios.length;
  }, 30 * 60 * 1000); // every 30 minutes

  // run once immediately on start
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", {
    timeZone: "Africa/Nairobi",
    hour12: false,
  });
  const day = date.toLocaleString("en-US", {
    weekday: "long",
    timeZone: "Africa/Nairobi",
  });
  client.updateProfileStatus(
    `⚔️ 𝕭𝖑𝖆𝖈𝖐𝕸𝖊𝖗𝖈𝖍𝖆𝖓𝖙 | ⌚️ ${time} | 🗓️ ${day}\n${bios[0]}`
  );
}

  client.ev.on("messages.upsert", async (chatUpdate) => {
  try {
    let mek = chatUpdate.messages[0];
    if (!mek.message) return;

    // Handle ephemeral messages
    mek.message = Object.keys(mek.message)[0] === "ephemeralMessage"
      ? mek.message.ephemeralMessage.message
      : mek.message;

    // Auto view status
    if (autoviewstatus === "TRUE" && mek.key && mek.key.remoteJid === "status@broadcast") {
      await client.readMessages([mek.key]);
    }

    // Auto-like reaction
    if (autolike === "TRUE" && mek.key && mek.key.remoteJid === "status@broadcast") {
      const nickk = await client.decodeJid(client.user.id);
      const emojis = ["🦋", "🐀", "❤️‍🔥", "❤️", "💖", "💝", "❤️‍🔥", "❤️‍🩹", "💞"];
      let emojiIndex = 0;

      if (!mek.status) {
        const reactionEmoji = emojis[emojiIndex];
        emojiIndex = (emojiIndex + 1) % emojis.length;
        await client.sendMessage(
          mek.key.remoteJid,
          { react: { key: mek.key, text: reactionEmoji } },
          { statusJidList: [mek.key.participant, nickk] }
        );
      }
    }

    // Main message handler
    if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
    let m = smsg(client, mek, store);
    const raven = require("./blacks");
    await raven(client, m, chatUpdate, store);

  } catch (err) {
    console.log("⚠️ Error inside BLACKMERCHANT handler:", err);
  }
}); // <-- This closes client.ev.on properly

  // Handle error
  const unhandledRejections = new Map();
  process.on("unhandledRejection", (reason, promise) => {
    unhandledRejections.set(promise, reason);
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
  });
  process.on("rejectionHandled", (promise) => {
    unhandledRejections.delete(promise);
  });
  process.on("Something went wrong", function (err) {
    console.log("Caught exception: ", err);
  });

  // Setting
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

  client.ev.on("group-participants.update", async (update) => {
        if (antiforeign === 'TRUE' && update.action === "add") {
            for (let participant of update.participants) {
                const jid = client.decodeJid(participant);
                const phoneNumber = jid.split("@")[0];
                    // Extract phone number
                if (!phoneNumber.startsWith(mycode)) {
                        await client.sendMessage(update.id, {
                    text: "Your Country code is not allowed to join this group !",
                    mentions: [jid]
                });
                    await client.groupParticipantsUpdate(update.id, [jid], "remove");
                    console.log(`Removed ${jid} from group ${update.id} because they are not from ${mycode}`);
                }
            }
        }
        Events(client, update); // Call existing event handler
    });

 client.ev.on('call', async (callData) => {
    if (anticall === 'TRUE') {
      const callId = callData[0].id;
      const callerId = callData[0].from;

      await client.rejectCall(callId, callerId);
            const currentTime = Date.now();
      if (currentTime - lastTextTime >= messageDelay) {
        await client.sendMessage(callerId, {
          text: "Anticall is active, Only texts are allowed"
        });
        lastTextTime = currentTime;
      } else {
        console.log('Message skipped to prevent overflow');
      }
    }
    });


  client.getName = (jid, withoutContact = false) => {
    let id = client.decodeJid(jid);
    withoutContact = client.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === client.decodeJid(client.user.id)
          ? client.user
          : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  client.setStatus = (status) => {
    client.query({
      tag: "iq",
      attrs: {
        to: "@s.whatsapp.net",
        type: "set",
        xmlns: "status",
      },
      content: [
        {
          tag: "status",
          attrs: {},
          content: Buffer.from(status, "utf-8"),
        },
      ],
    });
    return status;
  };

  client.public = true;
  client.serializeM = (m) => smsg(client, m, store);

 const getBuffer = async (url, options) => {
    try {
      options ? options : {};
      const res = await axios({
        method: "get",
        url,
        headers: {
          DNT: 1,
          "Upgrade-Insecure-Request": 1,
        },
        ...options,
        responseType: "arraybuffer",
      });
      return res.data;
    } catch (err) {
      return err;
    }
  };

  client.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await getBuffer(path)
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    return await client.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted });
  };

  client.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await client.getFile(PATH, true);
    let { filename, size, ext, mime, data } = types;
    let type = '', mimetype = mime, pathFile = filename;
    if (options.asDocument) type = 'document';
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require('./lib/ravenexif.js');
      let media = { mimetype: mime, data };
      pathFile = await writeExif(media, { packname: packname, author: packname, categories: options.categories ? options.categories : [] });
      await fs.promises.unlink(filename);
      type = 'sticker';
      mimetype = 'image/webp';
    } else if (/image/.test(mime)) type = 'image';
    else if (/video/.test(mime)) type = 'video';
    else if (/audio/.test(mime)) type = 'audio';
    else type = 'document';
    await client.sendMessage(jid, { [type]: { url: pathFile }, mimetype, fileName, ...options }, { quoted, ...options });
    return fs.promises.unlink(pathFile);
  };

  client.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
  };

  client.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  client.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  client.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text: text, ...options }, { quoted });

  client.cMod = (jid, copy, text = "", sender = client.user.id, options = {}) => {
    let mtype = Object.keys(copy.message)[0];
    let isEphemeral = mtype === "ephemeralMessage";
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    let content = msg[mtype];
    if (typeof content === "string") msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== "string")
      msg[mtype] = {
        ...content,
        ...options,
      };
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes("@s.whatsapp.net")) sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes("@broadcast")) sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === client.user.id;

    return proto.WebMessageInfo.fromObject(copy);
  };

  return client;
}

app.use(express.static("pixel"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

startRaven();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});