import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import marked from 'marked';

export default function Doc() {
  const router = useRouter();
  const { doc } = router.query;
  const [content, setContent] = useState('');
  const [docs, setDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryElements, setCategoryElements] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [resultVisibility, setResultVisibility] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  function search(event){
    const input = event.target.value;
    if(!input){
      setSearchResult([]);
      setResultVisibility(false);
      return;
    }
    const i=docs.filter(el => el.split('.md')[0].includes(input)).filter(el=>!el.includes(':')||input.startsWith(el.split(':')[0]+':'));
    const result=[...i.filter(el=>el===input), ...i.filter(el=>el!=input&&el.startsWith(input)), ...i.filter(el=>!el.startsWith(input))];
    setSearchResult(result);
    setResultVisibility(i.length>0);
  }
  
  function off(){
    if(isClicked){
      setIsClicked(false);
    }
    else{
      setSearchResult([]);
      setResultVisibility(false);
    }
  }

 const fetchContent = async (docName) => {
  try {
    const response = await fetch(`https://vajan.vercel.app/api/getContent?filePath=documents/${docName}`);
    const data = await response.json();
    
    if (!data.content || data.content.trim() === '') {
      setContent('<p>이 문서는 아직 내용이 없습니다.</p>');
      return;
    }

    let category = [];
    let content = marked.parse(data.content).replace(/\[([^\[\]]+)\]/g, `<a href='$1'>$1</a>`)
      .replace(/\{분류:[^\{\}]+\}/g, (match) => {
        category.push(match.replace(/\{|\}/g, ''));
        return '';
      });
    setCategories(category);
    setContent(content);
  } catch (error) {
    console.error('Error:', error);
    setContent('<p>문서를 불러올 수 없습니다.</p>');
  }
};

  const fetchDocs = async () => {
    try {
      const response = await fetch('https://vajan.vercel.app/api/getDocs');
      const data = await response.json();
      setDocs(data.fileNames);
      return data.fileNames;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  const fetchCategories = async (docs) => {
    const result = [];
    for (const el of docs) {
      try {
        const response = await fetch(`https://vajan.vercel.app/api/getContent?filePath=documents/${el}`);
        const data = await response.json();
        if (data.content && data.content.includes(`{${doc}}`)) {
          result.push(el);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    setCategoryElements(result);
  };

  useEffect(() => {
    if (!doc) return;

    const docName = `${doc}.md`;
    
    fetchContent(docName);
    
    fetchDocs().then(fileNames => {
      if (doc.startsWith('분류:')) {
        fetchCategories(fileNames);
      }
    });

  }, [doc]);

  if (!doc) return null;

  return (
    <>
      <Head>
        <title>{`${doc} - 바얀`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </Head>
      <div id="header">
        <h2><a href="https://vajan.vercel.app/대문">VAJAN</a></h2>
        <input type="text" id="input" onChange={search} onBlur={off}/>
      </div>
      <div id="contain">
        <div id="result" style={{display:resultVisibility?'block':'none'}} onMouseDown={()=>setIsClicked(true)}>
          {searchResult.map(el => (
            <div key={'RESULT:'+el.split('.md')[0]}><a href={`/${el.split(".md")[0]}`}>{el.split(".md")[0]}</a></div>
          ))}
        </div>
        <div id="category" style={{display:categories.length>0?'block':'none'}}>
          {categories.map(el => (
            <div key={'CATEGORY:'+el}><a href={`/${el}`}>{el.split(":")[1]}</a></div>
          ))}
        </div>
        <div id="content">
          <h1>{doc}</h1>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <ul>
            {categoryElements.map(el => (
              <li key={'CATEGORY_ELEMENT:'+el.split('.md')[0]}><a href={`/${el.split(".md")[0]}`}>{el.split('.md')[0]}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
