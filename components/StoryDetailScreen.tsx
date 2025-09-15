

import React, { useState } from 'react';
import type { Story } from '../types';
import Button from './Button';
import Icon from './Icon';
import { useAppContext } from '../hooks/useAppContext';

declare const html2pdf: any;
declare const jspdf: any;

interface StoryDetailScreenProps {
  story: Story;
  onEdit: (story: Story) => void;
  onDelete: () => void;
}

const StoryDetailScreen: React.FC<StoryDetailScreenProps> = ({ story, onEdit, onDelete }) => {
  const { deleteStory } = useAppContext();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleConfirmDelete = () => {
    deleteStory(story.id);
    onDelete();
  };
  
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
  
    try {
      const { jsPDF } = jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });
  
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;
      let currentY = margin;
  
      // --- STORY TEXT ---
      pdf.setFont('times', 'bold');
      pdf.setFontSize(14);
      const titleLines = pdf.splitTextToSize(story.question, contentWidth);
      pdf.text(titleLines, margin, currentY);
      currentY += titleLines.length * 14 * 1.15;
  
      currentY += 10;
  
      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      const bodyLines = pdf.splitTextToSize(story.content, contentWidth);
      pdf.text(bodyLines, margin, currentY);
      currentY += bodyLines.length * 12 * 1.15;
  
      // --- DIVIDER ---
      currentY += 20;
      pdf.setDrawColor(224, 220, 211); // --border-color
      pdf.setLineWidth(1);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 30;
  
      // --- IMAGES ---
      if (story.photos && story.photos.length > 0) {
        const loadedImages = await Promise.all(story.photos.map(imgData => new Promise<{ data: string; width: number; height: number; }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ data: imgData, width: img.width, height: img.height });
          img.onerror = reject;
          img.src = imgData;
        })));
  
        const imagePadding = 10;
        const redBorderWidth = 2;
        pdf.setDrawColor(197, 40, 47); // Red
        pdf.setLineWidth(redBorderWidth);
  
        const drawImageWithBorder = (img: { data: string; width: number; height: number; }, x: number, y: number, w: number, h: number) => {
          pdf.rect(x - redBorderWidth, y - redBorderWidth, w + (redBorderWidth * 2), h + (redBorderWidth * 2));
          pdf.addImage(img.data, 'JPEG', x, y, w, h);
        };
  
        if (loadedImages.length === 1) {
          const img = loadedImages[0];
          const aspectRatio = img.width / img.height;
          const imgWidth = contentWidth * 0.7;
          const imgHeight = imgWidth / aspectRatio;
          const imgX = (pageWidth - imgWidth) / 2;
          drawImageWithBorder(img, imgX, currentY, imgWidth, imgHeight);
        } else {
          const row1Images = loadedImages.slice(0, 2);
          const imgWidth = (contentWidth - imagePadding) / 2;
          let maxRowHeight = 0;
  
          row1Images.forEach((img, index) => {
            const aspectRatio = img.width / img.height;
            const imgHeight = imgWidth / aspectRatio;
            if (imgHeight > maxRowHeight) maxRowHeight = imgHeight;
            const imgX = margin + index * (imgWidth + imagePadding);
            drawImageWithBorder(img, imgX, currentY, imgWidth, imgHeight);
          });
  
          currentY += maxRowHeight + imagePadding;
  
          if (loadedImages.length === 3) {
            const img3 = loadedImages[2];
            const aspectRatio = img3.width / img3.height;
            const img3Width = contentWidth * 0.7;
            const img3Height = img3Width / aspectRatio;
            const img3X = (pageWidth - img3Width) / 2;
            drawImageWithBorder(img3, img3X, currentY, img3Width, img3Height);
          }
        }
      }
  
      pdf.save('memory.pdf');
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Sorry, there was an error creating the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="p-4 md:p-8 mb-8 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-color)] shadow-inner">
          <p className="text-lg font-semibold text-[var(--text-secondary)]">
              {new Date(story.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-3xl md:text-4xl my-4 text-[var(--accent-primary)]" style={{ fontFamily: 'var(--font-serif)', fontWeight: 'bold' }}>{story.question}</h2>
          <div className="max-w-none text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed text-lg" style={{ fontFamily: 'var(--font-serif)'}}>
            {story.content}
          </div>
          {story.photos.length > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {story.photos.map((photo, index) => (
                <div key={index} className="bg-white p-2 pb-6 shadow-md border border-gray-200 transform rotate-1">
                    <img src={photo} alt={`Story visual ${index+1}`} className="w-full" />
                </div>
              ))}
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button onClick={() => onEdit(story)} variant="secondary">
          <Icon name="edit" className="w-5 h-5" />
          Edit
        </Button>
        <Button onClick={handleExport} variant="secondary" disabled={isExporting}>
          <Icon name="download" className="w-5 h-5" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
        <Button onClick={() => setShowConfirmModal(true)} variant="danger">
          <Icon name="trash" className="w-5 h-5" />
          Delete
        </Button>
      </div>

      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="relative w-[90vw] max-w-md rounded-lg flex flex-col justify-center items-center p-8 md:p-10 popup-card-animate bg-[var(--background-secondary)] shadow-2xl border border-[var(--border-color)] notebook-lines text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-bold mb-4 text-[var(--accent-primary)]" style={{ fontFamily: 'var(--font-script)' }}>Confirm Deletion</h3>
            <p className="text-[var(--text-secondary)] mb-8">
              Are you sure you want to permanently delete this story? This action cannot be undone.
            </p>
            <div className="flex gap-4 w-full">
              <Button onClick={() => setShowConfirmModal(false)} variant="secondary" className="flex-1">
                No, Cancel
              </Button>
              <Button onClick={handleConfirmDelete} variant="danger" className="flex-1">
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryDetailScreen;