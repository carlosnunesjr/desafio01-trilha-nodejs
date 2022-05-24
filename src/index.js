const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find( user => user.username === username);

  if(!user){
    response.status(404).json({"error": "Username doesn't exists."});
    return;
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const exists = users.some( user => user.username === username);
  if(exists){
    return response.status(400).json({"error": "Username already exists."});
  }

  const jsonData = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(jsonData);

  return response.status(201).json(jsonData);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(todo);

  response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({"error": "Not Found"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({"error": "Not Found"});
  }

  todo.done = true;
  
  response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({"error": "Not Found"});
  }

  user.todos.splice(todo,1);
  
  response.status(204).send();
});

module.exports = app;