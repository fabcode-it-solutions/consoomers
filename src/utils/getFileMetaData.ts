export type FileMetadata = {
  format: string;
  size: number; // in bytes
  sizeFormatted: string; // human-readable size
  width?: number;
  height?: number;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 ** 2) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 ** 3) {
    return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  } else {
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  }
};

export async function getFileMetadata(file: File) {
  const format = file.name.split(".").pop()?.toLowerCase() || "";
  const baseInfo = {
    format,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
  };

  if (typeof window == undefined) {
    console.log("window-->", typeof window);
    // Server: no Image or document
    return baseInfo;
  }

  // Client: safe to use DOM APIs
  if (file.type.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      console.log(img);

      img.src = URL.createObjectURL(file);
      img.onload = () =>
        resolve({ ...baseInfo, width: img.width, height: img.height });
      img.onerror = reject;
    });
  }

  if (file.type.startsWith("video/")) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () =>
        resolve({
          ...baseInfo,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  return baseInfo;
}
