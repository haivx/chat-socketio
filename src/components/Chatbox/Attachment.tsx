import { FileType } from "@/constants";
import Image from "next/image";
import { FcFile } from "react-icons/fc";

interface AttachmentType {
  data: string;
  type: FileType;
  name: string;
}
const Attachment = ({ file }: { file: AttachmentType | null }) => {
  if (!file) return null;
  const onDownloadFile = () => {
    const link = document.createElement("a");
    link.href = file.data;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (file.type === FileType.IMG) {
    return (
      <Image
        onClick={onDownloadFile}
        alt="image-file"
        width={150}
        height={100}
        style={{ width: 150, height: 100 }}
        className="object-cover cursor-pointer"
        src={file.data}
      />
    );
  }
  return (
    <div className="flex justify-center items-center gap-3 p-3 bg-cyan-100 rounded-lg">
      <FcFile className="w-[30px] h-[30px]" />
      <span className="text-xs cursor-pointer" onClick={onDownloadFile}>
        {file.name}
      </span>
    </div>
  );
};

export default Attachment;
