import { useState } from "react";

function cloneElement(element: HTMLElement) {
  if (!element) {
    throw new Error("No element to export");
  }
  const dolly = element.cloneNode(true) as HTMLElement;
  dolly.querySelectorAll("thead").forEach((el) => {
    el.classList.remove();
    (el as HTMLElement).style.position = "static";
    (el as HTMLElement).style.top = "auto";
    (el as HTMLElement).style.zIndex = "auto";
  });
  dolly.style.position = "absolute";
  dolly.style.left = "-9999px";
  dolly.style.top = "-9999px";
  dolly.style.width = `${element.scrollWidth}`;
  dolly.style.height = `${element.scrollHeight}`;
  dolly.style.backgroundColor = "white";
  dolly.style.padding = "20px";
  dolly.style.opacity = "1";

  document.body.appendChild(dolly);
  return {
    dolly,
    cleanup() {
      if (dolly.parentNode) {
        dolly.parentNode.removeChild(dolly);
      }
    },
  };
}

async function exportElement(element: HTMLElement | null, fileName: string) {
  const html2canvas = (await import("html2canvas-pro")).default;
  const jspdf = (await import("jspdf")).default;
  if (!element) {
    console.warn("Table ref is null");
    return;
  }
  try {
    const { dolly, cleanup } = cloneElement(element);
    const canvas = await html2canvas(dolly, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#FFFFFF",
      width: element.scrollWidth,
      height: element.scrollHeight,
    });
    cleanup();
    const pdf = new jspdf({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    const pdfwidth = pdf.internal.pageSize.getWidth();
    const pdfheight = pdf.internal.pageSize.getHeight();
    const scale = Math.min(pdfwidth / canvas.width, pdfheight / canvas.height);

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      canvas.width * scale,
      canvas.height * scale,
    );
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Error exporting to pdf: ", error);
  }
}

function useExport(element: HTMLElement | null, fileName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  return {
    async handleExport() {
      try {
        setLoading(true);
        await exportElement(
          element,
          `${fileName}_${new Date().toISOString().split("T")[0]}_report`,
        );
      } catch (error) {
        setError((error as any).message ?? "Error");
      } finally {
        setLoading(false);
      }
    },
    loading,
    error,
  };
}
export default useExport;
