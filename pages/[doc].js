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

useEffect(() => {
    let isActive = true;
    const docName = doc ? `${doc}.md` : '대문.md';

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

  const fetchDocs = async () => {
      try {
        const response = await fetch('https://vajan.vercel.app/api/getDocs');
        const data = await response.json();
        if (isActive) {
          setDocs(data.fileNames);
          fetchCategories(data.fileNames);
        }
      } catch (error) {
        console.error('Error:', error);
      }
  };

  fetchDocs();
  
  const fetchCategories = async (docs) => {
  const i = docs.filter(el=>el.startsWith('분류:'));
  var result=[];
  
  for(const el of i){
    try {
      const response = await fetch(`https://vajan.vercel.app/api/getContent?filePath=documents/${el}`);
      const data = await response.json();
      if (isActive&&data.content.includes(`[${doc}]`)){
        result.push(el);
      }
    }catch(error){
      console.error('Error:', error);
    }
    };
    setCategories(result);
  };
  
  return () => {
    isActive = false;
  };
}, [doc]);

  return (
    <>
      <head>
        <title>{`${doc} - 바얀`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <div id="header">
        <h2><a href="https://vajan.vercel.app/대문">VAJAN</a></h2>
        <input type="text" id="input" onChange={search} onBlur={off}/>
      </div>
      <div id="contain">
      <div id="result" style={{display:resultVisibility?'block':'none'}} onMouseDown={()=>setIsClicked(true)}>
        {searchResult.map(el => (
          <div key={el.split('.md')[0]}><a href={`/${el.split(".md")[0]}`} style={{ color: '#282828' }}>{el.split(".md")[0]}</a></div>
        ))}
      </div>
      <div id="category" style={{visibility:categories.length>0?'visible':'hidden'}}>
        {categories.map(el => (
          <span key={'CATEGORY'+el.split('.md')[0]}><a href={`/${el.split(".md")[0]}`}>{el.split(".md")[0]}</a></span>
        ))}
      </div>
      <div id="content">
        <h2>{doc}</h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {doc==='대문' && docs.length > 0 && docs.map((el, index) => (
          <p key={index}>
            <a href={`/${el.split('.md')[0]}`} style={{ color: '#374052' }}>{el.split('.md')[0]}</a>
          </p>
        ))}
      </div>
      </div>
    </>
  );
}
