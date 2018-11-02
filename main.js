const cards = document.getElementsByClassName('card')
const nameSurname = document.getElementsByClassName('name-surname')
const edit = document.getElementsByClassName('edit')
const deletE = document.getElementsByClassName('delete');
const searchInput = document.querySelector('.search')
const wrapper = document.querySelector('.wrapper')
const registracijaPacijenata = document.querySelector('.registracija-pacijenata')
const registracija = document.querySelector('.registracija')
const zatvori = document.querySelector('.zatvori')
const dugmeZaSlanje = document.querySelector('.dugme-za-slanje')
const ime = document.querySelector('.ime')
const prezime = document.querySelector('.prezime')
const oboljenje = document.querySelector('.oboljenje')
const doktor = document.querySelectorAll('input[name=doktor]')
const promeneUkartonu = document.querySelector('.promene-u-kartonu')
const zatvoriPromene = document.querySelector('.zatvoriPromene')
const imePromena = document.querySelector('.imePromena')
const prezimePromena = document.querySelector('.prezimePromena')
const oboljenjePromena = document.querySelector('.oboljenjePromena')
const doktorPromena = document.querySelectorAll('input[name=doktorPromena]')
const dugmeZaPromenu = document.querySelector('.dugme-za-promenu')
const dijagnoza = document.getElementsByClassName('dijagnoza')
const doktorZaPretrazivanje = document.querySelectorAll('.doktor-za-pretrazivanje')
const izlecenDugme = document.getElementsByClassName('izlecen')

const ajaxSend = (method, url, arrOfObjs) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    if (method == 'POST') {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhr.send(`arrOfObjs=${arrOfObjs}`)
    } else if (method == 'GET') {
        xhr.send()
    }
    xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 400) {
            const parsedArrOfObjs = JSON.parse(xhr.responseText)
            if (parsedArrOfObjs.length > 0) {
                return JSON.parse(xhr.responseText)
            } else {
                return
            }
        }
    })
    xhr.addEventListener('error', () => {
        return console.log('error with response from server')
    })
}

let counter_for_new_created_card = cards.length + 1// za pravljenje data-key sluzi ova vrednost
let arrForChanges = []

let arr = [ // dodat o da bi proveravao da li radi, inace u salje se zahtev ka serveru da mi posalje sve pacijente
    { ime: 'ff', prezime: 'ff', doktor: 'doktor1', imeIprezime: 'ffff' },//imeIprezime napravio za pretragu pacijenata ne znam da li bih se snasao u pretrazi indexeddb sa dva uslova gde bih koristio dve kolone u pretrazi tacnije koristio IDBkeyRange()
    { ime: 'jj', prezime: 'jj', doktor: 'doktor1', imeIprezime: 'jjjj', izlecen: false, oboljenje: 'nesto' },
    { ime: 'kk', prezime: 'kk', doktor: 'doktor2', imeIprezime: 'kkkk', izlecen: false, oboljenje: 'nesto' },
    { ime: 'nn', prezime: 'nn', doktor: 'doktor2', imeIprezime: 'nnnn', izlecen: false, oboljenje: 'nesto' },
    { ime: 'aa', prezime: 'aa', doktor: 'doktor3', imeIprezime: 'aaaa', izlecen: false, oboljenje: 'nesto' },
    { ime: 'rr', prezime: 'rr', doktor: 'doktor3', imeIprezime: 'rrrr', izlecen: false, oboljenje: 'nesto' }
]

let db
let transaction

let req = indexedDB.open('lecenje', 5)
req.addEventListener('success', (e) => {
    console.log('connected')
})

req.addEventListener('upgradeneeded', (e) => {

    db = e.target.result
    console.log(db)
    let os = db.createObjectStore('pacijenti', { keyPath: 'id', autoIncrement: true })

    os.createIndex('pacijent', ['imeIprezime', 'doktor'], { unique: false })
    os.createIndex('imeIprezime', 'imeIprezime', { unique: false })
    os.createIndex('imeDoktora', 'doktor', { unique: false })

    transaction = e.target.transaction // error kao db.transaction('pacijenti','readwrite')
    let pacijentios = transaction.objectStore('pacijenti')

    const xhrResponse = ajaxSend('GET', '/') // planirani izlged JSON-a [{ime:'',prezime:'',dijagnoza:'',doktor:'',imeIprezime:'',izlecen:false}]

    if (xhrResponse != undefined) {
        for (let i = 0; i < xhrResponse.length; i++) {
            if (xhr.xhrResponse[i].izlecen == false) { //salje se cela tabela kartona i prikazuju se gde je izlecen:false
                pacijentios.add(arr[i])
            }
        }
    }

})


req.addEventListener('error', (e) => {
    console.log('error with connection')
})

//brisanje
for (let i = 0; i < deletE.length; i++) {
    deletE[i].addEventListener('click', (e) => {
        let parent = e.target.closest('.card')
        let key = parseInt(parent.dataset.key)
        let transaction1 = db.transaction(['pacijenti'], 'readwrite')
        let pacijentios = transaction1.objectStore('pacijenti')
        pacijentios.get(key).onsuccess = (e) => {
            let res = e.target.result
            arrForChanges.push({ ime: res.ime, prezime: res.prezime, doktor: res.doktor, dijagnoza: res.oboljenje, izlecen: res.izlecen, action: 'deleted' })
        }
        pacijentios.delete(key).onsuccess = (e) => {
            for (let i = 0; i < cards.length; i++) {
                if (cards[i] == parent) {
                    cards[i].remove()
                }
            }
        }
    })
}


//pretraga pacijenata    
searchInput.addEventListener('keyup', () => {
    let counter = 0
    if (searchInput.value.length >= 3) {
        let transaction = db.transaction(['pacijenti'], 'readwrite')
        let store = transaction.objectStore('pacijenti')
        store.openCursor().onsuccess = (e) => {
            let cursor = e.target.result
            console.log(cards)
            // console.log(cursor)
            if (cursor) {
                //dodaje u pretaragama pacijenata dodate pacijente koji se ne poklapaju sa pretragom ?????????
                if (cursor.value.imeIprezime.toLowerCase().indexOf(searchInput.value.toLowerCase()) == -1) {
                    for (let i = 0; i < cards.length; i++) {
                        if (cursor.value.imeIprezime.toLocaleLowerCase() == nameSurname[i].textContent.toLocaleLowerCase()) {
                            cards[i].style.display = 'none'
                        }
                    }
                }
                cursor.continue()
            }
        }

    } else {
        for (let i = 0; cards.length; i++) {
            if (cards[i].style.display == 'none') {
                cards[i].style.display = 'block'
            }
        }
    }
})


//brisanje baze 
window.addEventListener('beforeunload', () => {
    indexedDB.deleteDatabase('lecenje')
})

registracijaPacijenata.addEventListener('click', () => {
    registracija.style.display = 'block'
    wrapper.style.display = 'none'
})
zatvori.addEventListener('click', () => {
    registracija.style.display = 'none'
    wrapper.style.display = 'block'
})

//dodavanje novih pacijenata
dugmeZaSlanje.addEventListener('click', () => {
    if (ime.value != '' && prezime.value != '' && oboljenje.value != '') {
        registracija.style.display = 'none'
        wrapper.style.display = 'block'
        let checkedDoktror
        for (let i = 0; i < doktor.length; i++) {
            if (doktor[i].checked) {
                checkedDoktror = doktor[i].value
            }
        }
        let transaction = db.transaction(['pacijenti'], 'readwrite')
        let store = transaction.objectStore('pacijenti')
        let req = store.add({ ime: ime.value, prezime: prezime.value, doktor: checkedDoktror, imeIprezime: ime.value + ' ' + prezime.value })
        req.onsuccess = (e) => {
            let div = document.createElement('div')
            div.setAttribute('class', 'card')
            div.dataset.key = counter_for_new_created_card + ''
            counter_for_new_created_card++
            let p1 = document.createElement('p')
            p1.setAttribute('class', 'name-surname')
            let p1t = document.createTextNode(ime.value + prezime.value)
            p1.append(p1t)
            div.append(p1)
            let p2 = document.createElement('p')
            p2.setAttribute('class', 'dijagnoza-wrapper')
            let span1 = document.createElement('span')
            span1t = document.createTextNode('Dijagnoza: ')
            span1.append(span1t)
            p2.append(span1)
            let span2 = document.createElement('span')
            span2.setAttribute('class', 'dijagnoza')
            let span2t = document.createTextNode(oboljenje.value)
            span2.append(span2t)
            p2.append(span2)
            div.append(p2)
            let edit = document.createElement('div')
            edit.setAttribute('class', 'edit')
            let editt = document.createTextNode('Edit')
            edit.append(editt)
            div.append(edit)
            let izlecen = document.createElement('div')
            izlecen.setAttribute('class', 'izlecen')
            let izlecent = document.createTextNode('Izlecen?')
            izlecen.appendChild(izlecent)
            div.appendChild(izlecen)
            let delette = document.createElement('div')
            delette.setAttribute('class', 'delete')
            let delettet = document.createTextNode('Delete')
            delette.appendChild(delettet)
            div.appendChild(delette)
            wrapper.appendChild(div)

            arrForChanges.push({ ime: ime.value, prezime: prezime.value, doktor: checkedDoktror, dijagnoza: oboljenje.value, izlecen: false, action: 'created' })

            deletE[deletE.length - 1].addEventListener('click', (e) => { // najverovatnije kopirano
                let parent = e.target.closest('.card')
                let key = parseInt(parent.dataset.key)
                let transaction = db.transaction(['pacijenti'], 'readwrite')
                let store = transaction.objectStore('pacijenti')

                arrForChanges.push({ ime: ime.value, prezime: prezime.value, doktor: checkedDoktror, dijagnoza: oboljenje.value, izlecen: false, action: 'deleted' })

                store.delete(key).onsuccess = (e) => {
                    for (let i = 0; i < cards.length; i++) {
                        if (cards[i] == parent) {
                            cards[i].remove()
                        }
                    }
                }
            })
            izlecenDugme[izlecenDugme.length - 1].addEventListener('click', (e) => { // kopirano
                let parent = e.target.closest('.card')
                let key = parseInt(parent.dataset.key)
                let transaction = db.transaction(['pacienti'], 'readwrite')
                let store = transaction.objectStore('pacijenti')
                store.get(key).onsuccess = (e) => {
                    let res = e.target.result
                    res.izlecen = true
                    arrForChanges.push({ ime: res.ime, prezime: res.prezime, doktor: res.doktor, oboljenje: res.oboljenje, izlece: res.izlecen, action: 'updated' })
                    let req = store.put(res)
                    req.onsuccess = () => {
                        console.log('updated izlecen:true')
                    }
                }
            })

            edit[edit.length - 1].addEventListener('click', (e) => { // kopirano
                let parent = e.target.closest('.card')
                let key = parseInt(parent.dataset.key)
                let foundParentInArrayCards
                for (let i = 0; i < cards.length; i++) {
                    if (cards[i] == parent) {
                        foundParentInArrayCards = i
                    }
                }
                promeneUkartonu.style.display = 'block'


                dugmeZaPromenu.addEventListener('click', (e) => {
                    promeneUkartonu.style.display = 'none'
                    let transaction = db.transaction(['pacijenti'], 'readwrite')
                    let store = transaction.objectStore('pacijenti')
                    store.get(key).onsuccess = (e) => {
                        let res = e.target.result
                        console.log(res)
                        res.ime = imePromena.value == '' ? res.ime : imePromena.value
                        let imeP = res.ime
                        res.prezime = prezimePromena.value == '' ? res.prezime : prezimePromena.value
                        const checkedDoktrorPromena = () => {
                            for (let i = 0; i < doktorPromena.length; i++) {
                                if (doktorPromena[i].checked) {
                                    return doktorPromena[i].value
                                }
                            }
                            return false
                        }
                        res.doktor = checkedDoktrorPromena() == false ? res.doktor : checkedDoktrorPromena()
                        res.imeIprezime = (imePromena.value == '' && prezimePromena.value == '') ? res.imeIprezime : imePromena.value + prezimePromena.value
                        res.oboljenje = oboljenjePromena.value == '' ? res.oboljenje : oboljenjePromena.value

                        arrForChanges.push({ ime: res.ime, prezime: res.prezime, doktor: res.doktor, oboljenje: res.oboljenje, izlece: res.izlecen, action: 'updated' })

                        let req = store.put(res)

                        req.onsuccess = () => {
                            nameSurname[foundParentInArrayCards].textContent = imePromena.value == '' ? nameSurname[foundParentInArrayCards].textContent : imePromena.value
                            dijagnoza[foundParentInArrayCards].textContent = oboljenjePromena.value == '' ? dijagnoza[foundParentInArrayCards].textContent : oboljenjePromena.value

                        }
                    }
                })
            })
        }
    }
})

//izmene u kartonu
for (let i = 0; i < edit.length; i++) {
    edit[i].addEventListener('click', (e) => {
        let parent = e.target.closest('.card')
        let key = parseInt(parent.dataset.key)
        let foundParentInArrayCards
        for (let i = 0; i < cards.length; i++) {
            if (cards[i] == parent) {
                foundParentInArrayCards = i
            }
        }
        promeneUkartonu.style.display = 'block'


        dugmeZaPromenu.addEventListener('click', (e) => {
            promeneUkartonu.style.display = 'none'
            let transaction = db.transaction(['pacijenti'], 'readwrite')
            let store = transaction.objectStore('pacijenti')
            store.get(key).onsuccess = (e) => {
                let res = e.target.result
                console.log(res)
                res.ime = imePromena.value == '' ? res.ime : imePromena.value
                let imeP = res.ime
                res.prezime = prezimePromena.value == '' ? res.prezime : prezimePromena.value
                const checkedDoktrorPromena = () => {
                    for (let i = 0; i < doktorPromena.length; i++) {
                        if (doktorPromena[i].checked) {
                            return doktorPromena[i].value
                        }
                    }
                    return false
                }
                res.doktor = checkedDoktrorPromena() == false ? res.doktor : checkedDoktrorPromena()
                res.oboljenje = oboljenjePromena.value == '' ? res.oboljenje : oboljenjePromena.value
                res.imeIprezime = (imePromena.value == '' && prezimePromena.value == '') ? res.imeIprezime : imePromena.value + prezimePromena.value
                
                arrForChanges.push({ ime: res.ime, prezime: res.prezime, doktor: res.doktor, oboljenje: res.oboljenje, izlecen: res.izlecen, action: 'updated' })
                
                let req = store.put(res)
               
                req.onsuccess = () => {
                    nameSurname[foundParentInArrayCards].textContent = imePromena.value == '' ? nameSurname[foundParentInArrayCards].textContent : imePromena.value
                    dijagnoza[foundParentInArrayCards].textContent = oboljenjePromena.value == '' ? dijagnoza[foundParentInArrayCards].textContent : oboljenjePromena.value

                }
            }
        })
    })
}
zatvoriPromene.addEventListener('click', () => {
    promeneUkartonu.style.display = 'none'
})

// pretrazivanje pacijanata po doktoru
for (let i = 0; i < doktorZaPretrazivanje.length; i++) {
    doktorZaPretrazivanje[i].addEventListener('click', (e) => {
        for (let i = 0; i < cards.length; i++) {
            cards[i].style.display = 'none'
        }
        let imeDoktora = e.currentTarget.textContent.toLowerCase()
        console.log(imeDoktora)
        let transaction = db.transaction(['pacijenti'], 'readwrite')
        let store = transaction.objectStore('pacijenti')
        let index = store.index('imeDoktora')
        index.openCursor(imeDoktora).onsuccess = (e) => {
            let cursor = e.target.result
            console.log(cursor)
            if (cursor == null) {
                return
            }
            // ne pretrazuje dodate pacijente ???
            for (let i = 0; i < cards.length; i++) {
                if (nameSurname[i].textContent.toLocaleLowerCase() == cursor.value.imeIprezime.toLowerCase()) {
                    cards[i].style.display = 'block'
                }
            }

            cursor.continue()
        }
    })
}

for (let i = 0; i < izlecenDugme.length; i++) {
    izlecenDugme[i].addEventListener('click', (e) => {
        let parent = e.target.closest('.card')
        let key = parseInt(parent.dataset.key)
        console.log(parent)

        let transaction = db.transaction(['pacijenti'], 'readwrite')
        let store = transaction.objectStore('pacijenti')
        store.get(key).onsuccess = (e) => {
            let res = e.target.result
            res.izlecen = true

            arrForChanges.push({ ime: res.ime, prezime: res.prezime, doktor: res.doktor, oboljenje: res.oboljenje, izlece: res.izlecen, action: 'updated' })

            store.put(res)
        }
    })
}
const interval = setInterval(() => {
    ajaxSend(arrForChanges)
    arrForChanges = []
}, 600000) // na 10 min