const todoList = [];

function add(todo) {
  todoList.push(todo);
  console.log(`Added: ${todo}`);
}

function remove(index) {
  if (index >= 0 && index < todoList.length) {
    const removedTodo = todoList.splice(index, 1)[0];
    console.log(`Removed: ${removedTodo}`);
  } else {
    console.error('Invalid todo index');
  }
}

function list() {
  console.log('Current todos:');
  todoList.forEach((todo, index) => {
    console.log(`${index + 1}. ${todo}`);
  });
}

module.exports = { add, remove, list };
