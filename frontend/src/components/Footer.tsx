import { AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full max-w-2xl mx-auto mt-12 pt-6 pb-8 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-caption text-text-tertiary">
        <p className="flex items-center gap-1.5">
          <AlertCircle size={14} />
          本工具仅供个人学习研究使用，请遵守相关法律法规
        </p>
        <p>
          抖音去水印解析下载 &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
