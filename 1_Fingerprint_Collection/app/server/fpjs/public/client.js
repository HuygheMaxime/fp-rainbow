const socket = io();

function envoie() {
  var fpPromise = FingerprintJS.load()

 fpPromise
    .then(fp => fp.get())
    //.then(result => console.log(result.visitorId))

  link = window.location.href
  id = link.slice(link.indexOf('#')+1, link.length);
  console.log(id)

  fpPromise
    .then(fp => fp.get())
    .then(result => socket.emit("ecrireDansFichier",{id: id, result: result}))
}


envoie();
