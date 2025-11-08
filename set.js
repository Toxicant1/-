
/* ⚙️ Configuration Section
   💀 Owner: 𝖀𝖓𝖐𝖓𝖔𝖜𝖓
   🧩 Note: If you're using a panel, edit this part carefully.
   🚀 No need to configure if deploying via Heroku — just set environment variables.
*/

// 🧠 Session Setup
const sessionName = 'sessionBLACK MD;;;BmV2QCpb#KsXro_2rWVnq5oBdu_boafmLt_SnTpVh2qoG5V4RRuI';
const session = process.env.SESSION || 'BLACK MD;;;BmV2QCpb#KsXro_2rWVnq5oBdu_boafmLt_SnTpVh2qoG5V4RRuI';

// ⚡ Auto Settings
const autobio = process.env.AUTOBIO || 'TRUE';
const autolike = process.env.AUTOLIKE_STATUS || 'TRUE';
const autoviewstatus = process.env.AUTOVIEW_STATUS || 'TRUE';
const welcomegoodbye = process.env.WELCOMEGOODBYE || 'TRUE';
const autoread = process.env.AUTOREAD || 'FALSE';
const antidel = process.env.ANTIDELETE || 'TRUE';
const anticall = process.env.AUTOREJECT_CALL || 'TRUE';
const antilink = process.env.ANTILINK || 'TRUE';
const antilinkall = process.env.ANTILINK_ALL || 'TRUE';
const antitag = process.env.ANTITAG || 'TRUE';
const antibot = process.env.ANTIBOT || 'FALSE';
const antiforeign = process.env.ANTIFOREIGN || 'FALSE';

// 🧩 Basic Bot Info
const mode = process.env.MODE || 'PRIVATE';
const prefix = process.env.PREFIX || '';
const appname = process.env.APP_NAME || '';
const botname = process.env.BOTNAME || '𝐁𝐋𝐀𝐂𝐊-𝐌𝐃 𝐁𝐎𝐓';
const herokuapi = process.env.HEROKU_API;
const gptdm = process.env.GPT_INBOX || 'FALSE';
const wapresence = process.env.WA_PRESENCE || 'recording';
const mycode = process.env.CODE || '254';
const port = process.env.PORT || 10000;

// 👑 Developer / Owner Info
const dev = process.env.DEV || '254741819582';
const DevRaven = dev.split(",");
const author = process.env.STICKER_AUTHOR || '𝗕𝗢𝗧';
const packname = process.env.STICKER_PACKNAME || '𝐁𝐋𝐀𝐂𝐊𝐌𝐄𝐑𝐂𝐇𝐀𝐍𝐓';

// 💬 Menu & Visuals
const menulink = process.env.MENU_LINK || 'https://files.catbox.moe/jxxwms.jpeg';
const menu = process.env.MENU_TYPE || 'IMAGE';

// 🚫 Message Handling
const badwordkick = process.env.BAD_WORD_KICK || 'FALSE';
const bad = process.env.BAD_WORD || 'fuck';

// ⚠️ Default Messages
const admin = process.env.ADMIN_MSG || '𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗿𝗲𝘀𝗲𝗿𝘃𝗲𝗱 𝗳𝗼𝗿 𝗔𝗱𝗺𝗶𝗻𝘀!';
const group = process.env.GROUP_ONLY_MSG || '𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗺𝗲𝗮𝗻𝘁 𝗳𝗼𝗿 𝗚𝗿𝗼𝘂𝗽𝘀!';
const botAdmin = process.env.BOT_ADMIN_MSG || '𝗜 𝗻𝗲𝗲𝗱 𝗔𝗱𝗺𝗶𝗻 𝗽𝗿𝗲𝘃𝗶𝗹𝗲𝗱𝗴𝗲𝘀!';
const NotOwner = process.env.NOT_OWNER_MSG || '𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗺𝗲𝗮𝗻𝘁 𝗳𝗼𝗿 𝘁𝗵𝗲 𝗼𝘄𝗻𝗲𝗿!';

// 📦 Export Configuration
module.exports = {
  session,
  sessionName,
  autobio,
  author,
  packname,
  dev,
  DevRaven,
  badwordkick,
  bad,
  mode,
  group,
  NotOwner,
  botname,
  botAdmin,
  antiforeign,
  menu,
  autoread,
  antilink,
  admin,
  mycode,
  antilinkall,
  anticall,
  antitag,
  antidel,
  wapresence,
  welcomegoodbye,
  antibot,
  herokuapi,
  prefix,
  port,
  gptdm,
  appname,
  autolike,
  autoviewstatus
};