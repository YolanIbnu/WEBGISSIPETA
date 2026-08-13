import fitz

# Extract Bagas thesis
bagas_path = r'D:\idm download\SEMESTER 8 YOLAN\TA YOLAN\JURNAL YOLAN\note yolan\Skripsi Atas\01.BAB I - III.pdf bagas.pdf'
doc = fitz.open(bagas_path)
text = ''
for page in doc:
    text += page.get_text()
with open('bagas_thesis.txt', 'w', encoding='utf-8') as f:
    f.write(text)
print(f'Bagas: {len(doc)} pages, {len(text)} chars')
doc.close()

# Extract Yolan NEW thesis
yolan_path = r'D:\idm download\SEMESTER 8 YOLAN\TA YOLAN\SKRIPSI ASLI YOLAN\Proposal Yolan ibnu TA(Skripsi) BAB 1-3 REVISI NEW April baru.pdf'
doc2 = fitz.open(yolan_path)
text2 = ''
for page in doc2:
    text2 += page.get_text()
with open('yolan_thesis_new.txt', 'w', encoding='utf-8') as f:
    f.write(text2)
print(f'Yolan NEW: {len(doc2)} pages, {len(text2)} chars')
doc2.close()
