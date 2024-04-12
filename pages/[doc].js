import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Doc() {
  const router = useRouter();
  const { doc } = router.query;
  const [content, setContent] = useState('');
  const [docs, setDocs] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [visibility, setVisibility] = useState(false);
  
  function parse(input) {
    //<p> 태그(舊)
    //input=input.replace(/(?=(?:\n\n)|^)([^#\n ]+)(?=(?:\n#+ [^ ]))||(?<=(?:#+ [^ ]+\n))([^#\n ]+)(?=(?:\n\n)|$)||(?<=(?:\n\n))([^\n ]+)(?=(?:\n\n))/g,'<p>$1</p>');
    // ***굵고 기울어진 글씨***
    input=input.replace(/\*\*\*([^\*\n ]|[^\*\n ][^\*\n]*[^\*\n ])\*\*\*/g,'<b><i>$1</i></b>');
    // **굵은 글씨**
    input=input.replace(/\*\*([^\*\n ]|[^\*\n ][^\*\n]*[^\*\n ])\*\*/g,'<b>$1</b>');
    // *기울어진 글씨*
    input=input.replace(/\*([^\*\n ]|[^\*\n ][^\*\n]*[^\*\n ])\*/g,'<i>$1</i>');
    // %하이라이트%
    input=input.replace(/\%([^\%\n ]|[^\%\n ][^\%\n]*[^\%\n ])\%/g,'<mark>$1</mark>');
    // ++윗줄++
    input=input.replace(/\+\+([^\+\n ]|[^\+\n ][^\+\n]*[^\+\n ])\+\+/g,'<span style="text-decoration:overline;">$1</span>');
    // ~~취소선~~
    input=input.replace(/~~([^\~\n ]|[^\~\n ][^\~\n]*[^\~\n ])\~~/g,'<span style="text-decoration:line-through;">$1</span>');
    // __밑줄__
    input=input.replace(/__([^\_\n ]|[^\_\n ][^\_\n]*[^\_\n ])__/g,'<span style="text-decoration:underline;">$1</span>');
    // ^윗첨자^
    input=input.replace(/\^([^\^\n ]|[^\^\n ][^\^\n]*[^\^\n ])\^/g,'<sup>$1</sup>');
    // ..밑첨자..
    input=input.replace(/\.\.([^\.\n ]|[^\.\n ][^\.\n]*[^\.\n ])\.\./g,'<sub>$1</sub>');
    //# h1, ## h2, ### h3, ...
    input=input.replace(/(?<=\n|^)(#{1,6}) ([^\n]+)/g,function(match,hashes,text){
      return `<h${hashes.length}>${text}</h${hashes.length}>`;
    });
    //[링크 그대로]
    input=input.replace(/(?<=[^\!])\[([^\[\]\n]+)\](?=[^\(])/g,'<a href="$1">$1</a>');
    //[링크 이름 바꿈](example.org)
    input=input.replace(/\[([^\[\]\n]+)\]\(([^\(\)]+)\)/g,'<a href="$2">$1</a>');
    //![이미지]
    input=input.replace(/\!\[([^\[\]\n]+)\](?=[^\(])/g,'<img src="$1">');
    //> 인용
    input = input.replace(/(?:\n|^)>( [^\n]*(?:\n(?!>\n|[\n$])[^\n]*)*)/g, function(match, p1) {
      return `<blockquote>${p1.trim().replace('  \n','<br>').replace('\n','')}</blockquote>`;
    });
    //---
    input=input.replace(/(?<=\n)-{3,}(?=\n)/,'<hr>');
    //(P-진행률)
    input=input.replace(/\(P-([0-9]{1,2}|100)\)/,'<progress max="100" value="$1">$1%</progress>');
    //* 리스트
    input=input.replace(/(?<=\n|^)(\*+ .+\n)+(?=(?:[^\*]|\*+\S|$))/g, function(match){
      var lines=match.trim().split('\n');
      var result='';
      var stack=[];
  
      lines.forEach(function(line){
        var level = line.lastIndexOf('*', 0) + 1;
        var content = line.substring(level).trim();
  
        while(stack.length>level){
            result+="</ul>\n";
            stack.pop();
        }
        while(stack.length<level){
            result+="<ul>\n";
            stack.push(level);
        }
        result+="<li>"+content+"</li>\n";
      });
      while(stack.length>0){
        result+="</ul>\n";
        stack.pop();
      }
      return result;
    });
    input = input
    .replace(/(<\/h[1-6]>)/g, '$1\n\n')
    .replace(/(<h[1-6]>)/g, '\n\n$1')
    .split(/\n\n+/)
    .map(line => {
      if (!line.match(/<\/?h[1-6]>/) && line.trim() !== '') {
        return `<p>${line.trim()}</p>`;
      }
      return line.trim();
    })
    .join('');
    //<br> 태그
    input=input.replace(/ {2}\n/g,'<br>');
    //\n없애기
    input=input.replace(/\n/g,'');
    return input;
  }

  function search(event){
    const input = event.target.value;
    if(!input||docs.filter(el => el.includes(input))){
      setSearchResult([]);
      setVisibility(false);
      return;
    }
    const i=docs.filter(el => el.includes(input));
    setSearchResult(i);
    setVisibility(i.length>0);
  }
  
  function off(){
    setSearchResult([]);
    setVisibility(false);
  }

  useEffect(() => {
    let isActive = true;
    const docName = doc ? `${doc}.txt` : '대문.txt';

    const fetchContent = async () => {
      try {
        const response = await fetch(`https://vajan.vercel.app/api/getContent?filePath=documents/${docName}`);
        const data = await response.json();
        if (isActive) {
          setContent(parse(data.content));
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
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchDocs();

    return () => {
      isActive = false;
    };
  }, [doc]);
  
  return (
    <>
      <head>
        <title>{`${doc} - 바얀`}</title>
      </head>
      <div id="header">
        <h2><a href="https://vajan.vercel.app/대문" style={{ color: '#374052', marginLeft: '20px' }}>VAJAN</a></h2>
        <input type="text" id="input" onChange={search} onBlur={off}/>
      </div>
      <div id="result" style={{display:visibility?'block':'none'}}>
        {searchResult.map(el => (
          <div key={el.split('.txt')[0]}><a href={`/${el.split(".txt")[0]}`} style={{ color: '#282828' }}>{el.split(".txt")[0]}</a></div>
        ))}
      </div>
      <div id="contain">
        <h2>{doc}</h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {doc==='대문' && docs.length > 0 && docs.map((el, index) => (
          <p key={index}>
            <a href={`/${el.split('.txt')[0]}`} style={{ color: '#374052' }}>{el.split('.txt')[0]}</a>
          </p>
        ))}
      </div>
    </>
  );
}
