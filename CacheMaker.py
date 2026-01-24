import os
from datetime import datetime

# الإعدادات
EXCLUDED_DIRS = {'.venv', '.git', 'noneed', '__pycache__'}
# تأكد إن .jpg و .png و .json ممسوحين من القائمة دي عشان يتسجلوا كاش
EXCLUDED_EXTENSIONS = {
    '.bat', '.txt', '.exe', '.mp4', '.py', '.bak', '.zip',
    '.mp3', '.sh', '.h', '.c', '.o', '.ld', '.d', '.dockerignore'
}
EXCLUDED_FILES = {'.gitignore', 'COPYING', 'LICENSE', 'MAKEFILE', 'Makefile', 'README.md', 'dockerfile', '.gitinclude'}
OUTPUT_FILE = 'PSFree.manifest'

def create_manifest():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    manifest_path = os.path.join(root_dir, OUTPUT_FILE)
    
    with open(manifest_path, 'w', encoding='utf-8') as f:
        # رأس الملف
        f.write("CACHE MANIFEST\n")
        f.write(f"# Version: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("CACHE:\n")
        f.write("index.html\n") # التأكيد على الصفحة الرئيسية
        
        # البحث في كل المجلدات
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # استبعاد المجلدات غير المطلوبة
            dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
            
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                relpath = os.path.relpath(filepath, root_dir)
                
                ext = os.path.splitext(filename)[1].lower()
                
                # الشروط: لا تسجل الملف لو كان في الممنوعات أو هو نفسه ملف المانيفست
                if (ext in EXCLUDED_EXTENSIONS or 
                    filename in EXCLUDED_FILES or 
                    filename == OUTPUT_FILE):
                    continue
                
                # كتابة المسار بصيغة الويب (استبدال \ بـ /)
                f.write(f"{relpath.replace(os.sep, '/')}\n")
        
        # قسم الشبكة (للسماح بالروابط الخارجية مثل واتساب)
        f.write("\nNETWORK:\n")
        f.write("*\n")
        f.write("https://wa.me/\n")
        f.write("https://api.whatsapp.com/\n")

    print(f"✅ تم إنشاء {OUTPUT_FILE} بنجاح!")
    print(f"🚀 تم تسجيل جميع الصور والملفات في القائمة.")

if __name__ == "__main__":
    create_manifest()