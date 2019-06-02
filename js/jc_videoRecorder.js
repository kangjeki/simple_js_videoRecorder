/* -----------------------------------------------------------------------------------------------------------------------------------------
	Project 		: simple video recorder;
	ECMA Script 	: min ES6;
	Author 			: JC Programs;

	note 			: 	jika camera tidak dapat dimuat, aktifkan SSL protokol HTTPS;
						Test on Apache Server;
------------------------------------------------------------------------------------------------------------------------------------------*/
(function() {
	// deklarasi umum 
	const doc = document; const $ = (tg) => {const trg = doc.querySelector(tg); return trg}; const $$ = (tg) => {const trg = doc.querySelectorAll(tg); return trg};
	
	// membuat prototype event (hanya untuk mempermudah)
	Window.prototype.jcEvent = function(el, event, callback) {
		el.addEventListener(event, function(e){
			callback(e);
		})
	}

	// deklarasi selector / inisialisasi
	let video 			= $('#myVideo'),
		player 			= $('#player'),
		myTimer 		= $('#myTimer'),
		myInfo 			= $('#myInfo'),
		startRecord 	= $('#_jc_btnStart_'),
		stopRecord 		= $('#_jc_btnStop_'),
		playRecord 		= $('#_jc_btnPlay_'),
		btnDownload 	= $('#_jc_btnDownload_');

	// initialisasai mimetype dan type video
	let mimeType 	= "video/webm;codecs=vp8",
		type 		= "video/mp4";

	// ------------------------------------------------------------------------------------------------------------
	const startCamera = () => {
		// deklarasi configurasi userMedia
		let constrant  = { 
			audio	: false, 					// menonaktifkan audio (opsi true untuk aktif audio)
			video 	: {
				facingMode	: "environment", 	// memuat camera utama
				width 		: {min: 640, ideal: 1280, max: 1920},
				height 		: {min: 480, ideal: 720, max: 1080}
			}
		}

		// request API userMedia (load camera)
		navigator.mediaDevices.getUserMedia(constrant)
		.then((stream) => {

			// cek suport media browser 
			if ('srcObject' in video) {

				// memuat data stream ke myvideo
				video.srcObject = stream;

				// memulai camera
				video.play();

				// deklarasi global stream
				this.stream 	= stream;
			}

			// opsi browser tidak suport srcObject
			else {
				// memuat data stream ke myvideo
				video.src = window.URL.createObjectURL(stream);

				// memulai camera
				video.play();
			}
		})
		.catch((err) => {
			// notifikasi error memuat camera
			alert('!ERROR ' + err);
		});
	}

	// ------------------------------------------------------------------------------------------------------------
	const _action = {
		startRecord : () => {
			// request API MediaRecorder
			this.mr 		= new MediaRecorder(this.stream, {mimeType: mimeType});
			this.chunks 	= []; 		// deklarasi global array chunks
			let wk 			= 0;		// deklarasi timer recorder

			this.mr.start(1000); 		// memulai perekaman dalam interval 1000 (1s)/chunk data
			this.mr.ondataavailable = ev => {
				if (ev.data && ev.data.size) {
					this.chunks.push(ev.data); 	// menambahkan data chunks ke array Chunks
				}
				myTimer.innerHTML = wk; 		// menampilkan timer berjalan
				wk += 1;						// auto increment timer
			}
		},

		stopRecord : () => {
			// menghentikan perekaman
			this.mr.stop();

			// menjalankan fungsi promLoad
			_action.promLoad();
		},

		playRecord : () => {
			// memulai video hasil perekaman
			player.play();
		},

		promLoad : () => {
			// mengembas chunks dalam satu blob data dan merubah menjadi url data
			let blobData 	= new Blob(this.chunks, {type: type}),
				uriBlob 	= window.URL.createObjectURL(blobData);

			// membuat ajax request data / untuk DOM Promise
			let ajx = new XMLHttpRequest();
				ajx.responseType = 'blob';

			ajx.onload = function() {
				// Menampilkan Info Ukuran Video dan Jenis
				myInfo.innerHTML = `
					Size : ${String( Math.floor(ajx.response.size/1000) )}kb<br>
					type : ${ajx.response.type}
				`;

				// Merubah response load blob menjadi data url
				let uriData = window.URL.createObjectURL(ajx.response);

				// set data url ke player video
				player.src 	= uriData;

				// set data url ke link download
				btnDownload.href = uriData;
			}
			ajx.open('GET', uriBlob);
			ajx.send();
		}
	}

	// ------------------------------------------------------------------------------------------------------------
	const event = () => {
		// event statment untuk tombol dkk
		jcEvent(startRecord, 'click', () => {
			_action.startRecord();
		});
		jcEvent(stopRecord, 'click', () => {
			_action.stopRecord();
		});
		jcEvent(playRecord, 'click', () => {
			_action.playRecord();
		});
	}

	// ------------------------------------------------------------------------------------------------------------
	// memulai camera dan event
	startCamera();
	event();
}());