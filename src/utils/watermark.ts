export function addWatermark(dataUrl: string, lat: number, lng: number, address: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const barH = Math.max(64, img.height * 0.09);
      const fontSize = Math.max(16, img.width * 0.028);

      // Semi-transparent background bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
      ctx.fillRect(0, img.height - barH, img.width, barH);

      // Coordinates line
      ctx.fillStyle = '#4fc3f7';
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText(`\u{1F4CD} ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 12, img.height - barH + fontSize + 6);

      // Address line
      const maxChars = Math.floor(img.width / (fontSize * 0.55));
      const shortAddr = address.length > maxChars ? address.substring(0, maxChars - 1) + '…' : address;
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(fontSize * 0.78)}px Arial`;
      ctx.fillText(shortAddr, 12, img.height - 10);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = dataUrl;
  });
}
