import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/Header.tsx';
let content = readFileSync(path, 'utf8');

// 1. إزالة سطر QR من dev
content = content.replace(
  "        { name: 'مولد QR Code', href: '/tools/qr-generator' },\n",
  ''
);

// 2. إضافة productivity بعد dev
const oldEnd = `        { name: 'Color Picker', href: '/tools/color-picker' },
      ],
    },
};`;

const newEnd = `        { name: 'Color Picker', href: '/tools/color-picker' },
      ],
    },
    productivity: {
      icon: Zap,
      title: 'أدوات الإنتاجية',
      color: 'from-brand-500 to-brand-600',
      items: [
        { name: 'مولّد QR Code', href: '/tools/qr-generator', hot: true },
      ],
    },
};`;

if (content.includes(oldEnd)) {
  content = content.replace(oldEnd, newEnd);
  writeFileSync(path, content, 'utf8');
  console.log('✅ تم نقل QR إلى أدوات الإنتاجية');
} else {
  console.log('⚠️ لم يتم العثور على النمط');
  console.log('📋 سنتحقق من البنية');
}
