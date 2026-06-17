// backend/utils/ResumeAnalysis/resumeParser.js
const fs = require("fs");
const { PdfReader } = require("pdfreader");
const mammoth = require("mammoth");

const parseResume = async (filePath) => {
  if (!filePath) {
    throw new Error("No file path provided to the resume parser.");
  }

  const extension = filePath.split(".").pop().toLowerCase();

  if (extension === "pdf") {
    return new Promise((resolve, reject) => {
      let textContent = "";

      new PdfReader().parseFileItems(filePath, (err, item) => {
        if (err) {
          console.error("PDF Reader extraction core failure:", err);
          return reject(new Error(`PDF extraction failed: ${err.message}`));
        }

        if (item && item.text) {
          textContent += item.text + " ";
        }

        if (!item) {
          resolve(textContent.trim());
        }
      });
    });
  }

  if (extension === "docx") {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (docxError) {
      console.error("Mammoth text extraction error:", docxError);
      throw new Error(`Failed to parse Word Document: ${docxError.message}`);
    }
  }

  throw new Error(`Unsupported file format extension: .${extension}`);
};

module.exports = parseResume;