import styles from 'grayblue.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Doc() {
  const router = useRouter();
  const { doc } = router.query;
  const [content, setContent] = useState('');
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    let docName = '대문.txt';
    if (doc) {
      docName = doc + '.txt';
    }
    if (!doc) {
      fetch('https://vajan.vercel.app/api/getDocs')
        .then((response) => response.json())
        .then((data) => {
          setDocs(data.fileNames);
          return fetch('https://vajan.vercel.app/api/getContent?filePath=documents/' + docName);
        })
        .then((response) => response.json())
        .then((data) => {
          setContent(marked.parse(data.content));
        })
        .catch((error) => console.error('Error:', error));
    }
    else {
      fetch('https://vajan.vercel.app/api/getContent?filePath=documents/' + docName)
        .then((response) => response.json())
        .then((data) => {
          setContent(`<h2>${docName}</h2>` + marked.parse(data.content));
        })
        .catch((error) => console.error('Error:', error));
    }
  }, [doc]);

  return (
    <div id="contain">
      <h2>{doc || '대문'}</h2>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {docs.length > 0 && docs.map((el, index) => (
        <p key={index}>
          <a href={`../${el.split('.txt')[0]}`}>{el.split('.txt')[0]}</a>
        </p>
      ))}
    </div>
  );
}
