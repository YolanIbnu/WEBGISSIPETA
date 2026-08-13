import fitz

pdf_path = r'D:\idm download\SEMESTER 8 YOLAN\TA YOLAN\SKRIPSI ASLI YOLAN\Proposal Yolan ibnu TA(Skripsi) BAB 1-3 REVISI NEW April.pdf'
output_path = r'D:\idm download\SEMESTER 8 YOLAN\TA YOLAN\Program WebQgis Yolan\WEBQGIS\thesis_text_output.txt'

doc = fitz.open(pdf_path)
text = ''
for page in doc:
    text += page.get_text()

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(text)

print(f'Done. Total pages: {len(doc)}, Total chars: {len(text)}')
