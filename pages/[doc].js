import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import marked from 'marked';

export default function Doc() {
  const router = useRouter();
  const { doc } = router.query;
  const [content, setContent] = useState('');
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    let isActive = true;
    const docName = doc ? `${doc}.txt` : '대문.txt';

    const fetchContent = async () => {
      try {
        const response = await fetch(`https://vajan.vercel.app/api/getContent?filePath=documents/${docName}`);
        const data = await response.json();
        if (isActive) {
          setContent(marked.parse(data.content));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchContent();

    if (!doc || doc === '대문') {
      const fetchDocs = async () => {
        try {
          const response = await fetch('https://vajan.vercel.app/api/getDocs');
          const data = await response.json();
          if (isActive) {
            setDocs(data.fileNames);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchDocs();
    }

    return () => {
      isActive = false;
    };
  }, [doc]);

  return (
    <div id="header">
      <h2><a href="https://vajan.vercel.app/대문" style="color:#374052;margin-left:20px;">VAJAN</a></h2>
    </div>
    <div id="contain">
      <h2>{doc || '대문'}</h2>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {(!doc || doc === '대문') && docs.length > 0 && docs.map((el, index) => (
        <p key={index}>
          <a href={`/${el.split('.txt')[0]}`} style="color:#374052;">{el.split('.txt')[0]}</a>
        </p>
      ))}
    </div>
  );
}
