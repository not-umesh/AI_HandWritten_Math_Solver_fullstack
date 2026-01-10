const fs = require('fs');
const path = require('path');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Valid minimal PNG data (1x1 purple pixel) - we'll resize later
// This is a valid PNG file in base64
const PURPLE_1024_PNG = `iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF
yGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0w
TXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRh
LyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3MDEt
MDk6MjQ6NTcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcv
MTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIi
Pjwv`;

// Create a simple valid PNG using pure Node.js
function createSimplePNG(width, height, r, g, b, filename) {
    // PNG Signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR chunk
    function createIHDR(w, h) {
        const data = Buffer.alloc(13);
        data.writeUInt32BE(w, 0);
        data.writeUInt32BE(h, 4);
        data.writeUInt8(8, 8);  // bit depth
        data.writeUInt8(2, 9);  // color type (RGB)
        data.writeUInt8(0, 10); // compression
        data.writeUInt8(0, 11); // filter
        data.writeUInt8(0, 12); // interlace
        return createChunk('IHDR', data);
    }

    // Create chunk with CRC
    function createChunk(type, data) {
        const typeBuffer = Buffer.from(type);
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length, 0);

        // Simple CRC32
        const crcData = Buffer.concat([typeBuffer, data]);
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < crcData.length; i++) {
            crc ^= crcData[i];
            for (let j = 0; j < 8; j++) {
                crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
            }
        }
        crc = (crc ^ 0xFFFFFFFF) >>> 0;

        const crcBuffer = Buffer.alloc(4);
        crcBuffer.writeUInt32BE(crc, 0);

        return Buffer.concat([length, typeBuffer, data, crcBuffer]);
    }

    // IDAT chunk (compressed image data)
    function createIDAT(w, h, r, g, b) {
        const zlib = require('zlib');

        // Raw image data (filter byte + RGB for each pixel)
        const raw = [];
        for (let y = 0; y < h; y++) {
            raw.push(0); // filter byte (none)
            for (let x = 0; x < w; x++) {
                raw.push(r, g, b);
            }
        }

        const compressed = zlib.deflateSync(Buffer.from(raw), { level: 9 });
        return createChunk('IDAT', compressed);
    }

    // IEND chunk
    function createIEND() {
        return createChunk('IEND', Buffer.alloc(0));
    }

    const png = Buffer.concat([
        signature,
        createIHDR(width, height),
        createIDAT(width, height, r, g, b),
        createIEND()
    ]);

    fs.writeFileSync(path.join(assetsDir, filename), png);
    console.log(`✅ Created ${filename} (${width}x${height})`);
}

console.log('🎨 Creating valid PNG assets...\n');

// Create all required assets with purple/dark theme colors
// Dark purple background: RGB(26, 26, 46) = #1a1a2e
// Accent purple: RGB(102, 126, 234) = #667eea

createSimplePNG(1024, 1024, 102, 126, 234, 'icon.png');
createSimplePNG(1024, 1024, 102, 126, 234, 'adaptive-icon.png');
createSimplePNG(1284, 2778, 26, 26, 46, 'splash.png');
createSimplePNG(48, 48, 102, 126, 234, 'favicon.png');

console.log('\n🎉 All assets created successfully!');
console.log('📁 Location: frontend/assets/');