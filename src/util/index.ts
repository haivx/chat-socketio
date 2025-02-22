export const isImageFile = (file: File) => {
  const imageExtensions = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  const extension = file?.type;
  console.log({ extension });
  return imageExtensions.includes(extension);
};
