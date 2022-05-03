let products = [];
const productApi = useProductApi();
const productForm = document.getElementById('product-form');
const fields = document.querySelectorAll('#product-form .form-field');
const productTbody = document.getElementById('product-table');
const contentButtons = document.getElementById('content-buttons');
const addButton = document.getElementById('add-product');
addButton.addEventListener('click', productFormAction);

const loader = document.getElementById('loader');

const handleLoader = (status) => {
  switch (status) {
    case 'show':
      loader.style.display = 'flex';
      break;
    case 'hide':
      loader.style.display = 'none';
      break;
    default:
      break;
  }
};

let productFormMode = 'create';
let productId = undefined;

let currentProduct = {
  name: '',
  quantity: '',
  brand: '',
  foodGroup: '',
  price: '',
  expeditionDate: '',
  expirationDate: '',
  description: '',
};

function validate(event) {
  const { name, value } = event.target;
  currentProduct[name] = value;
}

fields.forEach((field) => {
  field.addEventListener('input', validate);
});

function productFormAction() {
  switch (productFormMode) {
    case 'create':
      createProduct();
      break;
    case 'update':
      updateProduct();
      break;
    default:
      break;
  }
}

function changeActionProductButton() {
  switch (productFormMode) {
    case 'create':
      addButton.innerText = 'Agregar';
      addButton.className = 'btn btn-primary';
      break;
    case 'update':
      addButton.innerText = 'Actualizar';
      addButton.className = 'btn btn-info text-white';
      break;
    default:
      break;
  }
}

function cancelProductActionButton() {
  switch (productFormMode) {
    case 'create':
      document.getElementById('cancel-button').remove();
      break;
    case 'update':
      if (document.getElementById('cancel-button') !== null) {
        return;
      } else {
        const cancelButton = document.createElement('button');
        cancelButton.id = 'cancel-button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.innerText = 'Cancelar';
        cancelButton.type = 'button';
        cancelButton.addEventListener('click', () => {
          cancelButton.remove();
          productFormMode = 'create';
          productForm.reset();
          changeActionProductButton();
        });
        contentButtons.appendChild(cancelButton);
      }

      break;
    default:
      break;
  }
}

async function createProduct() {
  handleLoader('show');
  const product = await productApi.create(currentProduct);
  products.push({ ...product });
  listProducts();
  productForm.reset();
  handleLoader('hide');
}

async function updateProduct() {
  handleLoader('show');
  const product = await productApi.update(productId, currentProduct);
  products = products.map((item) => {
    if (item.id === productId) {
      return { ...product };
    }

    return item;
  });
  listProducts();
  productForm.reset();
  productFormMode = 'create';
  changeActionProductButton();
  cancelProductActionButton();
  handleLoader('hide');
}

async function deleteProduct(id) {
  handleLoader('show');
  await productApi.remove(id);
  products = products.filter((product) => {
    return product.id !== id;
  });
  listProducts();
  handleLoader('hide');
}

function loadProductInForm(id) {
  productFormMode = 'update';
  productId = id;
  currentProduct = products.find((product) => product.id === id);

  fields.forEach((field) => {
    field.value = currentProduct[field.name];
  });
  changeActionProductButton();
  cancelProductActionButton();
}

const modalHtmlElement = document.getElementById('view-product');
const boostrapModal = new bootstrap.Modal(modalHtmlElement);

async function showProduct(id) {
  handleLoader('show');
  const product = await productApi.read(id);
  //Llamar el api para mostrar el producto
  const modalTitle = document.querySelector('#view-product .modal-title');
  const modalBody = document.querySelector('#view-product .modal-body');
  boostrapModal.show();
  modalBody.innerHTML = `
      <ul>
        <li><b>Nombre:</b> ${product.name}</li>
        <li><b>Cantidad:</b> ${product.quantity}</li>
        <li><b>Marca:</b> ${product.brand}</li>
        <li><b>Grupo de alimento:</b> ${product.foodGroup}</li>
        <li><b>Precio:</b> ${product.price}</li>
        <li><b>Fecha de expedición:</b> ${product.expeditionDate}</li>
        <li><b>Fecha de expiración:</b> ${product.expirationDate}</li>
        <li><b>Descripción:</b><p>${product.description}</p></li>
    </ul>
      `;
  modalTitle.innerText = product.name;
  handleLoader('hide');
}

async function listProducts(firstLoad) {
  handleLoader('show');
  productTbody.innerHTML = '';
  if (firstLoad) products = await productApi.list();
  products.forEach((product) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <th scope="row">${product.id}</th>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.brand}</td>
            <td>${product.foodGroup}</td>
            <td>${product.price}</td>
            <td>${product.expeditionDate}</td>
            <td>${product.expirationDate}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="loadProductInForm(${product.id})">
                    Editar
                    </button>
                <button
                    type="button"
                    class="btn btn-info text-white"
                    onclick="showProduct(${product.id})">
                    Ver registro
                    </button>
                <button
                    type="button"
                    class="btn btn-danger"
                    onclick="deleteProduct(${product.id})">
                    Eliminar
                    </button>
            </td>
        `;
    productTbody.appendChild(row);
  });
  handleLoader('hide');
}
listProducts(true);
