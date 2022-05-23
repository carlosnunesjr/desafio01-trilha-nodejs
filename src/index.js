const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function exitsUser(username){
  return users.some( user => user.username === username);
};

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const exists = exitsUser(username);

  if(!exists){
    response.status(404).json({"error": "Username doesn't exists."});
    return;
  }
  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const exists = exitsUser(username);
  if(exists){
    response.status(400).json({"error": "Username already exists."});
    return;
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
  const {username} = request.headers;

  const userIndex = users.findIndex( user => user.username === username);

  response.json(users[userIndex]?.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {title, deadline} = request.body;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  const userIndex = users.findIndex( user => user.username === username);
  users[userIndex]?.todos.push(todo);
  response.json(users[userIndex].todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params;
  const {title, deadline} = request.body;

  const userIndex = users.findIndex( user => user.username === username);
  users[userIndex]?.todos.map(todo => {
    if(todo.id === id){
      todo.title = title;
      todo.deadline = new Date(deadline);
    }
  });

  response.json(users[userIndex]?.todos);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params;

  const userIndex = users.findIndex( user => user.username === username);
  users[userIndex]?.todos.map(todo => {
    if(todo.id === id){
      todo.done = true;
    }
  });
  
  response.json(users[userIndex]?.todos);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {username} = request.headers;
  const {id} = request.params;

  const userIndex = users.findIndex( user => user.username === username);
  users[userIndex].todos = users[userIndex]?.todos.filter(todo => todo.id !== id);
  
  response.json(users[userIndex]?.todos);
  
});

module.exports = app;