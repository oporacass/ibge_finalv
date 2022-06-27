const baseUrl = "https://servicodados.ibge.gov.br/api/"

const uf = document.getElementById("uf");
const municipio = document.getElementById("cidade");
const searchPib = document.getElementById("pib");
const searchPop = document.getElementById("pop");
const searchArea = document.getElementById("area");
const searchDens = document.getElementById("dens");
const searchEsc = document.getElementById("esc");
const compEst1 = document.getElementById("compEst1");
const compEst2 = document.getElementById("compEst2");


let anox = "2001";
let resultado = {}

var xmlHttp = new XMLHttpRequest();

window.addEventListener('load', async ()=>{
  const request = await fetch(baseUrl+"v1/localidades/estados")
  const response = await request.json()
  let options = '<option>Selecione o estado</option>'
  response.forEach(function(uf){
    options += '<option value="'+uf.sigla+'" ufId="'+uf.id+'">'+uf.nome+'</option>'
  })
  document.getElementById("uf").innerHTML = options
  document.getElementById("compEst1").innerHTML = options
  document.getElementById("compEst2").innerHTML = options
})

function update(){
  const select = document.getElementById('anos');
  anox = select.value
}

uf.addEventListener('change', async function(){
  const urlCidades = baseUrl+'v1/localidades/estados/'+uf.value+'/municipios'
  const request = await fetch(urlCidades)
  const response = await request.json()
  let options = '<option>Selecione a cidade</option>'

  response.forEach(function(cidades){
    options += '<option value="'+ cidades.id +'">'+cidades.nome+'</option>'
  })
  document.getElementById("cidade").innerHTML = options
})

function verificarValor(data){
  return data.length > 0 ? data[0].resultados[0].series[0].serie[anox] : "Não existem dados disponiveis para este ano."
}

function lil(){
  if(uf.value == "Selecione o estado" || municipio.value == "Selecione a cidade"){
    return alert("Preencha os campos necessários para a pesquisa.")
  }
  resultado = {}
  let cardBody = ""
  document.getElementById("data").hidden=true;
  if(searchPib.checked){
    xmlHttp.open( "GET", `${baseUrl}v3/agregados/21/periodos/${anox}/variaveis/37?localidades=N6[${municipio.value}]`, false );
    xmlHttp.send( null );
    resultado.pib = verificarValor(JSON.parse(xmlHttp.response))
    cardBody += `<tr><td>PIB em ${anox}: </td><td>${resultado.pib}</td></tr>`
  }
  if(searchPop.checked){
    xmlHttp.open( "GET", `${baseUrl}v3/agregados/6579/periodos/${anox}/variaveis/9324?localidades=N6[${municipio.value}]`, false );
    xmlHttp.send( null );
    resultado.pop = verificarValor(JSON.parse(xmlHttp.response))
    cardBody += `<tr><td>População em ${anox}: </td><td>${resultado.pop}</td></tr>`
  }
  if(searchArea.checked){
    xmlHttp.open( "GET", `${baseUrl}v3/agregados/1301/periodos/2010/variaveis/615?localidades=N6[${municipio.value}]`, false );
    xmlHttp.send( null );
    resultado.area = JSON.parse(xmlHttp.response)[0].resultados[0].series[0].serie["2010"]
    cardBody += `<tr><td>Área Territorial em 2010: </td><td>${resultado.area}</td></tr>`
  }
  if(searchDens.checked){
    xmlHttp.open( "GET", `${baseUrl}v3/agregados/1301/periodos/2010/variaveis/616?localidades=N6[${municipio.value}]`, false );
    xmlHttp.send( null );
    resultado.dens = JSON.parse(xmlHttp.response)[0].resultados[0].series[0].serie["2010"]
    cardBody += `<tr><td>Densidade Demográfica em 2010:    </td><td>${resultado.dens}</td></tr>`
  }
  if(searchEsc.checked){
    const ufId = uf.options[uf.selectedIndex].getAttribute('ufId')
    xmlHttp.open( "GET", `${baseUrl}v3/agregados/1187/periodos/${anox}/variaveis/2513?localidades=N3[${ufId}]&classificacao=2[6794]`, false );
    xmlHttp.send( null );
    resultado.esc = verificarValor(JSON.parse(xmlHttp.response))
    cardBody += `<tr><td>Taxa de alfabetização de pessoas de 15 anos:    </td><td>${resultado.esc}</td></tr>`
    xmlHttp.open( "GET", `${baseUrl}v3/agregados/1187/periodos/${anox}/variaveis/2513?localidades=N3[${ufId}]&classificacao=2[4]`, false );
    xmlHttp.send( null );
    resultado.escH = verificarValor(JSON.parse(xmlHttp.response))
    cardBody += `<tr><td>Taxa de alfabetização de homens de 15 anos:    </td><td>${resultado.escH}</td></tr>`
    xmlHttp.open( "GET", `${baseUrl}v3/agregados/1187/periodos/${anox}/variaveis/2513?localidades=N3[${ufId}]&classificacao=2[5]`, false );
    xmlHttp.send( null );
    resultado.escM = verificarValor(JSON.parse(xmlHttp.response))
    cardBody += `<tr><td>Taxa de alfabetização de mulheres de 15 anos:   </td><td>${resultado.escM}</td></tr>`
  }
  document.getElementById("resultBody").innerHTML = cardBody
  document.getElementById("munName").innerText = municipio.options[municipio.selectedIndex].text
  document.getElementById("estName").innerText = uf.options[uf.selectedIndex].text
  document.getElementById("data").hidden=false;
}

var tableToExcel = (function() {
  var uri = 'data:application/vnd.ms-excel;base64,'
    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
    , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
    , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
  return function(table, name) {
    if (!table.nodeType) table = document.getElementById(table)
    var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
    window.location.href = uri + base64(format(template, ctx))
  }
})()

function compararEstados(){
  const selectType = document.getElementById('chartType')
  const tipo = selectType.options[selectType.selectedIndex];
  if(compEst1.value == "Selecione o estado" || compEst2.value == "Selecione o estado" || tipo.value == "selecione"){
    return alert("Preencha os campos necessários para a pesquisa.")
  }
  xmlHttp.open( "GET", `${baseUrl}v3/agregados/6579/periodos/`, false );
  xmlHttp.send( null );
  const resp = JSON.parse(xmlHttp.response) 
  let anos = ""
  for(let i in resp){
    if(i == 0){
      anos += resp[i].id
    } else {
      anos += "|"+resp[i].id
    }
  }
  const ufId1 = compEst1.options[compEst1.selectedIndex].getAttribute('ufId')
  const ufId2 = compEst2.options[compEst2.selectedIndex].getAttribute('ufId')
  let comparacao = []
  xmlHttp.open( "GET", `${baseUrl}v3/agregados/6579/periodos/${anos}/variaveis/9324?localidades=N3[${ufId1}]`, false );
  xmlHttp.send( null );
  comparacao.push(JSON.parse(xmlHttp.response)[0].resultados[0].series[0].serie)
  xmlHttp.open( "GET", `${baseUrl}v3/agregados/6579/periodos/${anos}/variaveis/9324?localidades=N3[${ufId2}]`, false );
  xmlHttp.send( null );
  comparacao.push(JSON.parse(xmlHttp.response)[0].resultados[0].series[0].serie)
  document.getElementById('meuChart').innerHTML = ""
  document.getElementById('meuChart').innerHTML = '<canvas id="myChart" width="300" height="300"></canvas>'
  let labelsAno = Object.keys(comparacao[0])
  let dadosUf1 = []
  let dadosUf2 = []
  labelsAno.forEach((dados)=>{
    dadosUf1.push(comparacao[0][dados])
    dadosUf2.push(comparacao[1][dados])
  })
  const ctx = document.getElementById('myChart');
  let data = {}
  let options = {}
  switch (tipo.text) {
    case 'Linha':
      data = {
        labels: labelsAno,
        datasets: [{
            label: compEst1.options[compEst1.selectedIndex].text,
            data:dadosUf1,
            backgroundColor: [
                'rgba(255, 90, 132, 1.2)',
                'rgba(255, 90, 132, 1.2)',
                'rgba(255, 90, 132, 1.2)',
                'rgba(255, 90, 132, 1.2)',
                'rgba(255, 90, 132, 1.2)',
                'rgba(255, 90, 132, 1.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        },{
          label: compEst2.options[compEst2.selectedIndex].text,
          data: dadosUf2,
          backgroundColor: [
              'rgba(139, 0, 139, 1.2)',
              'rgba(139, 0, 139, 1.2)',
              'rgba(139, 0, 139, 1.2)',
              'rgba(139, 0, 139, 1.2)',
              'rgba(139, 0, 139, 1.2)',
              'rgba(139, 0, 139, 1.2)'
          ],
          borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
      }],  
    },
    options = {
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
      break;
    case 'Barra vertical':
      data = {
        labels:  labelsAno,
        datasets: [{
          label: compEst1.options[compEst1.selectedIndex].text,
          data: dadosUf1,
          backgroundColor: [
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        },
        {
          label: compEst2.options[compEst2.selectedIndex].text,
          data: dadosUf2,
          backgroundColor: [
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }]
      };
      break;
    case 'Barra horizontal':
      data = {
        labels:  labelsAno,
        datasets: [{
          label: compEst1.options[compEst1.selectedIndex].text,
          data: dadosUf1,
          backgroundColor: [
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)',
            'rgba(255, 90, 132, 1.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        },
        {
          label: compEst2.options[compEst2.selectedIndex].text,
          data: dadosUf2,
          backgroundColor: [
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)',
            'rgba(139, 0, 139, 1.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }]
      };
      options = {
        indexAxis: 'y',
      }
      break;
    default:
      break;
  }
  new Chart(ctx, {
    type: tipo.value,
    data,
    options   
});
}

