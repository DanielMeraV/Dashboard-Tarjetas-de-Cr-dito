// Variables globales para almacenar los datos de cada tabla
let clientesData = loadData('clientes') || [];
let tarjetasPrincipalesData = loadData('tarjetas-principales') || [];
let tarjetasAdicionalesData = loadData('tarjetas-adicionales') || [];
let historialCrediticioData = loadData('historial-crediticio') || [];

// Variable global para almacenar la información del cliente actual
let currentClient = null;


console.log(JSON.parse(localStorage.getItem('clientes')));
console.log(JSON.parse(localStorage.getItem('tarjetas-principales')));
console.log(JSON.parse(localStorage.getItem('tarjetas-adicionales')));
console.log(JSON.parse(localStorage.getItem('historial-crediticio')));

// Función para guardar datos en localStorage
function storeData(type, data) {
    try {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem(type, JSON.stringify(data));
        } else {
            console.error('LocalStorage no está disponible.');
        }
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);
    }
}

// Función para cargar datos desde localStorage
function loadData(type) {
    try {
        if (typeof(Storage) !== "undefined") {
            return JSON.parse(localStorage.getItem(type)) || [];
        } else {
            console.error('LocalStorage no está disponible.');
            return [];
        }
    } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
        return [];
    }
}


// Función para buscar un cliente por cédula y nombre
function findClient(cedula, nombre) {
    nombre = nombre.trim();
    return clientesData.find(client => client.cedula === parseInt(cedula, 10) && client.nombre.trim() === nombre);
}


// Funcion para leer el csv
function handleCSVUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
        const expectedFileName = getExpectedFileName(type);
        
        if (file.name !== expectedFileName) {
            alert(`Error: El archivo seleccionado debe ser ${expectedFileName}`);
            return;
        }
        
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                const data = results.data;
                processCSVData(data, type);
            }
        });
    }
}

// Manejar archivo arrastrado y soltado
function handleFile(file, type) {
    const expectedFileName = getExpectedFileName(type);

    if (file.name !== expectedFileName) {
        alert(`Error: El archivo seleccionado debe ser ${expectedFileName}`);
        return;
    }

    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            const data = results.data;
            processCSVData(data, type);
        }
    });
}

function getExpectedFileName(type) {
    switch(type) {
        case 'clientes':
            return 'clientes.csv';
        case 'tarjetas-principales':
            return 'tarjetas_principales.csv';
        case 'tarjetas-adicionales':
            return 'tarjetas_familiares.csv';
        case 'historial-crediticio':
            return 'movimientos.csv';
        default:
            return '';
    }
}

function processCSVData(data, type) {
    let processedData = [];
    
    switch(type) {
        case 'clientes':
            processedData = data.map(row => ({
                cedula: row['Cedula'],
                nombre: row['Nombre'],
                telefono: row['Telefono'],
                correo: row['Correo']
            }));
            clientesData = processedData;
            storeData('clientes', clientesData);
            alert('Se han cargado correctamente los datos del cliente');
            //console.log('Clientes:', clientesData);
            break;

        case 'tarjetas-principales':
            processedData = data.map(row => ({
                cedula: row['Cedula'],
                Numero: row['Numero'],
                tipo: row['Tipo'],
                fecha_emision: row['FechaEmision'],
                fecha_expiracion: row['FechaExpiracion'],
                saldo: row['Saldo'],
                tipo_tarjeta: row['TipoTarjeta']
            }));
            tarjetasPrincipalesData = processedData;
            storeData('tarjetas-principales', tarjetasPrincipalesData);
            alert('Se han cargado correctamente los datos de las tarjetas principales');
            //console.log('T.P:', tarjetasPrincipalesData);
            break;

        case 'tarjetas-adicionales':
            processedData = data.map(row => ({
                cedula: row['Cedula'],
                Numero: row['Numero'],
                tipo: row['Tipo'],
                fecha_emision: row['FechaEmision'],
                fecha_expiracion: row['FechaExpiracion'],
                saldo: row['Saldo'],
                tipo_tarjeta: row['TipoTarjeta']
            }));
            tarjetasAdicionalesData = processedData;
            storeData('tarjetas-adicionales', tarjetasAdicionalesData);
            alert('Se han cargado correctamente los datos de las tarjetas adicionales');
            //console.log('T.A.:', tarjetasAdicionalesData);
            break;

        case 'historial-crediticio':
            processedData = data.map(row => ({
                tarjeta: row['Tarjeta'],
                tipo_tarjeta: row['TipoTarjeta'],
                detalle_tarjeta: row['DetalleTarjeta'],
                monto: row['Monto'],
                saldo: row['Saldo'],
                fecha: row['Fecha'],
                tipo_movimiento: row['TipoMovimiento'],
                codigo_movimiento: row['CodigoMovimiento'],
                descripcion: row['Descripcion']
            }));
            historialCrediticioData = processedData;
            storeData('historial-crediticio', historialCrediticioData);
            alert('Se han cargado correctamente los datos del historial crediticio');
            //console.log('H.C.:', historialCrediticioData);
            break;
    }
}


// Llamada a la función de carga al iniciar la página
window.onload = function() {
    setupDragAndDrop();
    loadDefaultCSVs();
};

// Cargar automáticamente los csv al inicio
function loadDefaultCSVs() {
    const csvFolder = 'csv/';
    const csvFiles = {
        'clientes': 'clientes.csv',
        'tarjetas-principales': 'tarjetas_principales.csv',
        'tarjetas-adicionales': 'tarjetas_familiares.csv',
        'historial-crediticio': 'movimientos.csv'
    };

    if (clientesData.length === 0 && 
        tarjetasPrincipalesData.length === 0 && 
        tarjetasAdicionalesData.length === 0 && 
        historialCrediticioData.length === 0) {
        for (let type in csvFiles) {
            fetchCSV(csvFolder + csvFiles[type], type);
        }
    }
}


function fetchCSV(filePath, type) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo: ${filePath}`);
            }
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                complete: function(results) {
                    const data = results.data;
                    processCSVData(data, type);
                }
            });
        })
        .catch(error => {
            console.error('Error al procesar el CSV:', error);
        });
}



// Función para manejar el arrastre de archivos
function setupDragAndDrop() {
    const dropAreas = document.querySelectorAll('.drop-area');
    dropAreas.forEach(area => {
        area.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
            area.classList.add('dragover');
        });

        area.addEventListener('dragleave', (event) => {
            event.preventDefault();
            event.stopPropagation();
            area.classList.remove('dragover');
        });

        area.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            area.classList.remove('dragover');
            const file = event.dataTransfer.files[0];
            const id = area.getAttribute('for');
            handleFile(file, id);
        });
    });
}


