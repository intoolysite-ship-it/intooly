import type { Metadata } from 'next';
import JpgToWordClient from './JpgToWordClient';

export const metadata: Metadata = {
  title: 'JPG to Word Converter Free – Convert Image to Editable Word | Intooly',
  description:
    'Convert JPG and PNG images to editable Word documents online for free. Extract Arabic or English text with OCR, edit the result, or place the original image in a DOCX file. Images are processed in your browser.',
  keywords: [
    'JPG to Word',
    'JPG to Word converter',
    'image to Word',
    'convert image to Word',
    'JPG to DOCX',
    'Arabic OCR',
    'تحويل JPG إلى Word',
    'تحويل صورة إلى وورد',
    'استخراج النص من الصور',
  ],
  alternates: {
    canonical: '/tools/jpg-to-word',
  },
  openGraph: {
    title: 'JPG to Word Converter Free | Intooly',
    description:
      'Extract text from JPG or PNG images and create editable Word documents in your browser.',
    url: 'https://intooly.com/tools/jpg-to-word',
    type: 'website',
  },
};

export default function JpgToWordPage() {
  return <JpgToWordClient />;
}