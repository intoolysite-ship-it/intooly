import { readFileSync, writeFileSync } from "fs";
const path = "src/components/Header.tsx";
let content = readFileSync(path, "utf8");
content = content.replace("      { name: 'مولد QR Code', href: '/tools/qr-generator' },\n", "");
const oldEnd = "    ],\n  },\n};\n\nexport default function Header";
const newEnd = "    ],\n  },\n  productivity: {\n    icon: Zap,\n    title: 'أدوات الإنتاجية',\n    color: 'from-brand-500 to-brand-600',\n    items: [\n      { name: 'مولّد QR Code', href: '/tools/qr-generator', hot: true },\n    ],\n  },\n};\n\nexport default function Header";
if (content.includes(oldEnd)) {
  content = content.replace(oldEnd, newEnd);
  writeFileSync(path, content, "utf8");
  console.log("✅ تم نقل QR إلى أدوات الإنتاجية");
} else {
  console.log("⚠️ لم يتم العثور على النمط");
}
