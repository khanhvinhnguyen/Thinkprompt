import sys
import fitz  # PyMuPDF
from deep_translator import GoogleTranslator
import os
from fpdf import FPDF

def extract_text_and_images(input_file, output_dir):
    doc = fitz.open(input_file)
    full_text = ""
    image_counter = 0
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        try:
            text = page.get_text("text")
        except Exception as e:
            print(f"Error extracting text from page {page_num}: {e}")
            text = ""
        full_text += text

        # Extract images
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = os.path.join(images_dir, f"image_{page_num+1}_{img_index+1}.{image_ext}")
            with open(image_filename, "wb") as image_file:
                image_file.write(image_bytes)
            image_counter += 1

    return full_text, image_counter

def translate_text(text):
    try:
        return GoogleTranslator(source='auto', target='en').translate(text)
    except Exception as e:
        print(f"Error translating text: {e}")
        return text

def convert_to_uppercase(text):
    return text.upper()

def save_text_as_pdf(text, output_file):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)
    for line in text.split('\n'):
        # Replace unsupported characters
        line = line.encode('latin-1', 'replace').decode('latin-1')
        pdf.cell(200, 10, txt=line, ln=True)
    pdf.output(output_file)

def main(input_file, output_file):
    if not os.path.exists(input_file):
        print(f"File {input_file} does not exist")
        sys.exit(1)

    output_dir = os.path.dirname(output_file)
    os.makedirs(output_dir, exist_ok=True)

    try:
        full_text, image_count = extract_text_and_images(input_file, output_dir)
        translated_text = translate_text(full_text)
        uppercase_text = convert_to_uppercase(translated_text)
        save_text_as_pdf(uppercase_text, output_file)

        print(f"Processed file saved to {output_file}")
        print(f"Extracted {image_count} images")

    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_file.py <input_file> <output_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    main(input_file, output_file)
