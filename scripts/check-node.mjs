// Vérifie la version de Node.js avant « npm run dev » / « npm start »
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 18 || (major === 18 && minor < 18)) {
  console.error(`\n❌ Node.js ${process.versions.node} est trop ancien. Installez Node.js 20 ou plus récent : https://nodejs.org\n`);
  process.exit(1);
}
