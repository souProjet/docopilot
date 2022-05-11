let fileManager = document.querySelector('.filemanager');
let fileContainer = document.querySelector('.filemanager .filecontainer');
let pageHeader = document.querySelector('.page-header');
let pageFooter = document.querySelector('.page-footer');
let pageName = document.querySelector('.page-header .page-name');
let pageContent = document.querySelector('.page .page-content');
let page = document.querySelector('.page');
let addFileBtn = document.querySelector('.file-item-add');
let loader1 = document.querySelector('.loading-1');
let loader2 = document.querySelector('.loading-2');
let savingBox = document.querySelector('.page-header .saving-box');
let shareBtn = document.querySelector('.page-header .page-btn .share');
let backupBtn = document.querySelector('.page-header .page-btn .backup');
let closeFileManager = document.querySelector('.filemanager .close');

let token = localStorage.getItem('token');
let shareToken = localStorage.getItem('share-token');
let fileToken = localStorage.getItem('file-token');
let first = false;
let issave = false;
let timeout, timeout2, timeout3 = null;
let charPos = 0;

if (window.location.search.split("=")[1]) {
    localStorage.setItem('token', window.location.search.split("=")[1]);
    localStorage.removeItem('share-token');
    localStorage.removeItem('file-token');
    window.location.href = "/";
}

function genToken(length) {
    let token = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        token += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return token;
}
async function domToPng(node) {
    let url = await domtoimage.toPng(node)
        .then(async function(dataUrl) {
            return await dataUrl
        })
        .catch(function(error) {
            console.error('oops, something went wrong!', error);
        });
    return url;
}
let selectionStor = "";

function translateinfrench() {
    let selection = selectionStor;

    if (selection) {
        pageContent.innerHTML = pageContent.innerHTML.replace(selection, '<span class="translate-text">' + selection + '</span>')
        fetch(`http://localhost:3000/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: selection
            })
        }).then(res => res.text()).then(data => {
            if (data.trim() != '') {
                pageContent.innerHTML = pageContent.innerHTML.replace('<span class="translate-text">' + selection + '</span>', data.trim());
            } else {
                pageContent.innerHTML = pageContent.innerHTML.replace('<span class="translate-text">' + selection + '</span>', selection);
            }
        });
    }
}

function simplify() {
    let selection = selectionStor;

    if (selection) {
        pageContent.innerHTML = pageContent.innerHTML.replace(selection, '<span class="simplify-text">' + selection + '</span>')
        fetch(`http://localhost:3000/simplify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: selection
            })
        }).then(res => res.text()).then(data => {
            if (data.trim() != '') {
                pageContent.innerHTML = pageContent.innerHTML.replace('<span class="simplify-text">' + selection + '</span>', data.trim());
            } else {
                pageContent.innerHTML = pageContent.innerHTML.replace('<span class="simplify-text">' + selection + '</span>', selection);
            }
        });
    }
}

function rephrase() {
    let selection = selectionStor;

    if (selection) {
        pageContent.innerHTML = pageContent.innerHTML.replace(selection, '<span class="rephrase-text">' + selection + '</span>')
        fetch(`http://localhost:3000/rephrase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: selection
            })
        }).then(res => res.text()).then(data => {
            if (data.trim() != '') {
                pageContent.innerHTML = pageContent.innerHTML.replace('<span class="rephrase-text">' + selection + '</span>', data.trim());
            } else {
                pageContent.innerHTML = pageContent.innerHTML.replace('<span class="rephrase-text">' + selection + '</span>', selection);
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', async() => {
    if (!token) {
        let input = document.createElement('input');
        input.classList.add('backup-code-input');
        input.placeholder = 'Avez-vous un code de souvegarde ?';
        pageHeader.append(input);
        document.querySelector('.backup-code-input').addEventListener('keyup', (e) => {
            if (e.key == 'Enter') {
                window.location = 'http://localhost:3000/?token=' + document.querySelector('.backup-code-input').value;
            }
        });
        localStorage.setItem('token', genToken(10));
        // localStorage.setItem('share-token', genToken(10));
        token = localStorage.getItem('token');
        shareToken = localStorage.getItem('share-token');
        first = true;

        setTimeout(() => {
            pageContent.innerHTML = `<span class="placeholder" style="opacity:.3;">Bonjour et bienvenu sur docopilot, votre éditeur de texte intelligent capable de prédire ce que vous aller écrire.<br><br>Faite un clique droit sur le texte séléctionné pour voir toutes les options.</span>`;
        }, 1000);

        // fetch(`http://localhost:3000/linksharetoken`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${token}`
        //     },
        //     body: JSON.stringify({
        //         shareToken: shareToken
        //     })
        // }).then(res => res.json()).then(res => {
        //     if (res.error) {
        //         console.log(res.error);
        //     } else {
        //         console.log(res);
        //     }
        // });

    } else {
        pageContent.focus();
    }
    document.querySelector('.qrcode').innerHTML = "Votre code : " + token;
    var qrcode = new QRCode(document.querySelector('.qrcode'), {
        text: "http://localhost:3000/?token=" + token,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    if (pageName.value == "") {
        pageName.style.opacity = ".3";
        pageName.value = "Sans nom";
    }
    if (fileToken && fileToken !== "none") {
        fetch(`http://localhost:3000/get/${fileToken}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.text())
            .then(res => {
                pageContent.innerHTML = decodeURIComponent(res.split('|||')[1]);
                pageName.value = decodeURIComponent(res.split('|||')[0]);
                pageName.style.opacity = "1";

            })
            .catch(err => console.log(err));
    } else if (fileToken == "none") {
        localStorage.setItem('file-token', genToken(10));
        fileToken = localStorage.getItem('file-token');
        fetch(`http://localhost:3000/create/${fileToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    console.log(res.error);
                } else {
                    console.log(res);
                }
            })
            .catch(err => console.log(err));

        let minia = await domToPng(page);

        fetch(`http://localhost:3000/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                file: minia,
                fileToken: fileToken
            })
        });
    } else if (fileToken == null) {
        fetch(`http://localhost:3000/getallfiles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json()).then(async data => {
            if (data.length > 0) {
                localStorage.setItem('file-token', data[0].split('-')[1].split('.')[0]);
                fileToken = localStorage.getItem('file-token');
                fetch(`http://localhost:3000/get/${fileToken}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(res => res.text())
                    .then(res => {
                        pageContent.innerHTML = decodeURIComponent(res.split('|||')[1]);
                        pageName.value = decodeURIComponent(res.split('|||')[0]);
                        pageName.style.opacity = "1";

                    })
                    .catch(err => console.log(err));
            } else {
                localStorage.setItem('file-token', genToken(10));
                fileToken = localStorage.getItem('file-token');
                fetch(`http://localhost:3000/create/${fileToken}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(res => res.json())
                    .then(res => {
                        if (res.error) {
                            console.log(res.error);
                        } else {
                            console.log(res);
                        }
                    })
                    .catch(err => console.log(err));

                let minia = await domToPng(page);

                fetch(`http://localhost:3000/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        file: minia,
                        fileToken: fileToken
                    })
                });
            }
        });
    }
    fetch(`http://localhost:3000/getallfiles`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(res => res.json()).then(data => {
        if (data.length > 0) {
            data.forEach(async file => {
                let miniaDiv = document.createElement('div');
                miniaDiv.classList.add('file-item');
                let minia = await fetch(`http://localhost:3000/getminia/${file.split('.')[0].split('-')[1]}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (minia.status == 200) {
                    let imageBlob = await minia.blob()
                    let imageObjectURL = URL.createObjectURL(imageBlob);
                    miniaDiv.style.backgroundImage = `url(${imageObjectURL})`;
                    miniaDiv.id = 'file-' + file.split('.')[0].split('-')[1];
                    let trash = document.createElement('img');
                    trash.classList.add('trash');
                    trash.src = 'http://localhost:3000/image/trash.jpg';
                    trash.setAttribute('onclick', `deleteFile('${file.split('.')[0].split('-')[1]}')`);
                    miniaDiv.appendChild(trash);
                    miniaDiv.setAttribute('onclick', `openFile('${file.split('.')[0].split('-')[1]}')`);
                    fileContainer.insertAdjacentElement('afterbegin', miniaDiv);

                    fetch(`http://localhost:3000/get/${file.split('.')[0].split('-')[1]}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        .then(res => res.text())
                        .then(res => {
                            document.querySelector('#file-' + file.split('.')[0].split('-')[1]).innerHTML += decodeURIComponent(res.split('|||')[0]);
                        })
                        .catch(err => console.log(err));
                }

            });

        } else {
            console.log('no file')
        }
    });
    setTimeout(() => {
        page.style.opacity = "1";
        pageHeader.style.opacity = "1";
        pageFooter.style.opacity = "1";
        loader2.style.opacity = "0";
        loader2.style.display = "none";
        setTimeout(() => {
            fileManager.style.opacity = "1";
            loader1.style.opacity = "0";
            loader1.style.display = "none";
        }, 200);
    }, 300)
});



function getSelectionText() {
    var text = "";
    if (document.getSelection) {
        text = document.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.document.selection.createRange().text;
    }
    return text;

}

function setCursor(pos, target) {
    var setpos = document.createRange();
    var set = window.getSelection();
    setpos.setStart(target.childNodes[0], pos);
    setpos.collapse(true);
    set.removeAllRanges();
    set.addRange(setpos);
    target.focus();
}
pageName.addEventListener('focusout', (e) => {
    if (e.target.value == "") {
        e.target.style.opacity = ".3";
        e.target.value = "Sans nom";
    } else {
        e.target.style.opacity = "1"
    }
});
pageName.addEventListener('focusin', (e) => {
    if (e.target.value == "Sans nom") {
        e.target.style.opacity = "1";
        e.target.value = "";
    }
})

pageName.addEventListener('input', () => {
    document.querySelector('#file-' + fileToken).innerHTML = `<img class="trash" src="http://localhost:3000/image/trash.jpg" onclick="deleteFile('${fileToken}')">` + pageName.value;
    if (timeout2) {
        clearTimeout(timeout2);
        issave = false;
        verifyPopup();
    }
    timeout2 = setTimeout(function() {
        fetch(`http://localhost:3000/save/${fileToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: pageName.value,
                content: pageContent.innerHTML
            })
        });
        issave = true;
        verifyPopup();
    }, 3000)
});

page.addEventListener('click', () => pageContent.focus());


pageContent.addEventListener('keyup', async(e) => {
    savingBox.style.color = "black";
    savingBox.innerHTML = '<img src="./image/loading.gif">enregistrement';
    pageContent.innerHTML.replaceAll('<br>', '\n');

    if (e.key == "Alt") {
        e.preventDefault();
        leaveContextMenu();
        if (document.querySelector('.completion-box')) {
            let completionContent = document.querySelector('.completion-box').innerHTML;
            document.querySelectorAll('.completion-box').forEach(e => e.remove());
            pageContent.innerHTML += completionContent;
            charPos = pageContent.innerHTML.length;
            setCursor(charPos, pageContent);
            saveFile();
        }
    }

    document.querySelector('.completion-box') ? document.querySelectorAll('.completion-box').forEach(e => e.remove()) : null;
    pageContent.classList.add('incompletion');
    if (timeout3) { clearTimeout(timeout3); }
    timeout3 = setTimeout(function() {
        if (pageContent.innerHTML.indexOf('<span class="completion-box">') == -1) {
            charPos = pageContent.innerHTML.length;
            fetch(`http://localhost:3000/completion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: pageContent.innerHTML.substring(pageContent.innerHTML.length - 150)
                })
            }).then(res => res.text()).then(data => {
                charPos = pageContent.innerHTML.length;
                pageContent.classList.remove('incompletion');
                pageContent.innerHTML += `<span class="completion-box">${" "+data.trim()}</span>`;
                setCursor(charPos, pageContent);
                let shortcut = document.createElement('div');
                shortcut.classList.add('shortcut-menu');
                shortcut.innerHTML = `<div class="shortcut-menu-item">Alt pour valider</div>`;
                shortcut.style.top = pageContent.offsetHeight + pageContent.offsetTop + 'px';
                shortcut.style.left = pageContent.offsetWidth / 4 + pageContent.offsetLeft + 'px';
                page.appendChild(shortcut);
            });
        }

    }, 1000)

    if (timeout) {
        clearTimeout(timeout);
        issave = false;
        verifyPopup();
    }
    timeout = setTimeout(async function() {
        saveFile();

    }, 3000)

});
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
pageContent.addEventListener('contextmenu', (e) => {
            leaveContextMenu();
            e.preventDefault();
            let selection = getSelectionText();
            if (selection) {
                let menu = document.createElement('div');
                menu.classList.add('context-menu');
                menu.innerHTML = `
                ${selection.length <= 1000 ? `<div class="context-menu-item" onclick="simplify();">Simplifier</div>` : ''}
                ${selection.length <= 1000 ? `<div class="context-menu-item" onclick="translateinfrench();">Traduire</div>`:''}
                ${selection.length <= 1000 ? `<div class="context-menu-item" onclick="rephrase();">Reformuler</div>` : '' }`;
        menu.style.top = e.pageY - 10 + 'px';
        menu.style.left = e.pageX - 50 + 'px';
        page.appendChild(menu);
        selectionStor = selection;
    }
});
pageContent.addEventListener('focusout', (e) => {
    if (first && pageContent.innerHTML == "") {
        pageContent.innerHTML = ` < span class = "placeholder"
        style = "opacity:.3;" > Bonjour et bienvenu sur docopilot, votre éditeur de texte intelligent capable de prédire ce que vous aller écrire. < br > < br > Faite un clique droit sur le texte séléctionné pour voir toutes les options. < /span>`;
    }
});
pageContent.addEventListener('focusin', (e) => {
    document.querySelectorAll('span.placeholder').forEach(e => e.remove());
    leaveContextMenu()
});
pageContent.addEventListener('click', (e) => leaveContextMenu());
pageContent.addEventListener('dbclick', (e) => leaveContextMenu());

function leaveContextMenu() {
    if (document.querySelector('.context-menu')) {
        document.querySelector('.context-menu').remove();
    }
    if (document.querySelector('.shortcut-menu')) {
        document.querySelector('.shortcut-menu').remove();
    }
    pageContent.innerHTML.replaceAll('<br>', '\n');

}
addFileBtn.addEventListener('click', (e) => {
    localStorage.setItem('file-token', 'none');
    window.location.reload();
});
let inDelete = false;

function openFile(theFileToken) {
    if (!inDelete) {
        if (theFileToken != fileToken) {
            localStorage.setItem('file-token', theFileToken);
            window.location.reload();
        }
    }
}

function deleteFile(theFileToken) {
    inDelete = true;
    if (theFileToken != fileToken) {
        fetch(`http://localhost:3000/delete/${theFileToken}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        document.querySelector('#file-' + theFileToken).remove();
        window.location.reload();
    } else {
        fetch(`http://localhost:3000/delete/${theFileToken}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        document.querySelector('#file-' + theFileToken).remove();
        try {
            localStorage.setItem('file-token', document.querySelector('.filemanager .filecontainer .file-item').id.split("-")[1]);
        } catch (e) {
            localStorage.removeItem('file-token');
        }
        window.location.reload();

    }
}

function verifyPopup() {
    if (issave) {
        window.onbeforeunload = null
    } else {
        window.onbeforeunload = () => {
            return "Vous quitter le site.";
        };
    }
}

async function saveFile() {

    fetch(`http://localhost:3000/save/${fileToken}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            content: pageContent.innerHTML.replace(/(<span class="completion-box">)(.*)(<\/span>)/gs, ''),
            name: pageName.value
        })

    }).then(res => res.text()).then(async data => {
        if (data == "ok") {
            let minia = await domToPng(page);
            fetch(`http://localhost:3000/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    file: minia,
                    fileToken: fileToken
                })
            }).then(res => res.text()).then(data => {
                if (data == "ok") {
                    setTimeout(async() => {
                        let minia = await fetch(`http://localhost:3000/getminia/${fileToken}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        if (minia.status == 200) {
                            let imageBlob = await minia.blob()
                            let imageObjectURL = URL.createObjectURL(imageBlob);
                            document.querySelector('#file-' + fileToken).style.backgroundImage = "url(" + imageObjectURL + ")";
                        }
                    }, 1000);
                    issave = true;
                    verifyPopup();
                    savingBox.style.color = "green";
                    savingBox.innerHTML = 'enregistré';
                }
            });
        }
    });
}

document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        savingBox.style.color = "black";
        savingBox.innerHTML = '<img src="./image/loading.gif">enregistrement';
        saveFile();
    }
});

// shareBtn.addEventListener('click', (e) => {
//     if (!navigator.clipboard) {
//         alert('Votre navigateur ne supporte pas le copier/coller');
//         return
//     }
//     navigator.clipboard.writeText("http://localhost:3000/share/" + fileToken+"/"+shareToken)
//         .then(() => {
//             shareBtn.style.color="green";
//             shareBtn.innerText="lien copié";
//             setTimeout(()=>{
//                 shareBtn.style.color="black";
//                 shareBtn.innerText="Partager";
//             },2000);
//     })
//         .catch(err => {
//         console.log('Something went wrong', err);
//     }) 
// });

backupBtn.addEventListener('click', (e) => {
    if(document.querySelector('.qrcode').classList.contains('active')){
        document.querySelector('.qrcode').classList.remove('active')
        backupBtn.innerHTML = 'Voir le QRcode';
    }else{
      
        document.querySelector('.qrcode').classList.add('active')
        backupBtn.innerText = "Cacher le QRcode";
    }
});

closeFileManager.addEventListener('click', (e) => {
    if(fileManager.classList.contains('close')){
        fileManager.classList.remove('close')
        closeFileManager.style.backgroundImage = "url('http://localhost:3000/image/close.png')";
    }else{
        fileManager.classList.add('close')
        closeFileManager.style.backgroundImage = "url('http://localhost:3000/image/rightarrow.png')";
    }
});