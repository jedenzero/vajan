var doc='대문.txt';
var docs=[];
var i='';
if(new URL(window.location.href).searchParams.get('doc')){
  doc=new URL(window.location.href).searchParams.get('doc');
  i='<h2>'+doc+'</h2>';
  fetch('https://vajan.vercel.app/api/getContent?filePath=documents/'+doc)
  .then(response => response.json())
  .then(data => {
    i+=marked.parse(data.content);
    document.getElementById('contain').innerHTML=i;
  })
  .catch(error => console.error('Error:', error));
}
else{
  i='<h2>'+doc+'</h2>';
  fetch('https://vajan.vercel.app/api/getDocs')
  .then(response => response.json())
  .then(data => {
      docs=data.fileNames;
      fetch('https://vajan.vercel.app/api/getContent?filePath=documents/'+doc+'.txt')
      .then(response => response.json())
      .then(data => {
        i+=marked.parse(data.content);
        docs.forEach(el=>{
          i+='<p><a href=\"?doc='+el.split('.txt')[0]+'\">'+el.split('.txt')[0]+'</a></p>';
        });
        document.getElementById('contain').innerHTML=i;
      })
      .catch(error => console.error('Error:', error));
  })
  .catch(error => console.error('Error:', error));
}
