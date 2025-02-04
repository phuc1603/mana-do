import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import './ToDoPage.css';
import Service from '../service';
import { isTodoCompleted } from '../utils';
import { TodoStatus } from '../models/todo';
import TodoItem from '../components/TodoItem';
import reducer, { initialState } from '../store/reducer';
import { setTodos, addTodo, toggleAllTodos, deleteAllTodos } from '../store/actions';

type EnhanceTodoStatus = TodoStatus | 'ALL';

const ToDoPage = () => {
    const history = useHistory();
    const [{ todos }, dispatch] = useReducer(reducer, initialState);
    const [showing, setShowing] = useState<EnhanceTodoStatus>('ALL');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        (async () => {
            const resp = await Service.getTodos();
            dispatch(setTodos(resp));
        })();
    }, []);

    const onCreateTodo = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputRef.current && inputRef.current.value.trim() !== '') {
            try {
                const resp = await Service.createTodo(inputRef.current.value.trim());
                dispatch(addTodo(todos, resp));
                inputRef.current.value = '';
            } catch (e) {
                if (e.response.status === 401) {
                    history.push('/');
                }
            }
        }
    };

    const onToggleAllTodo = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(toggleAllTodos(todos, e.target.checked));
    };

    const onDeleteAllTodo = () => {
        dispatch(deleteAllTodos());
    };

    const showTodos = todos.filter((todo) => {
        switch (showing) {
            case TodoStatus.ACTIVE:
                return todo.status === TodoStatus.ACTIVE;
            case TodoStatus.COMPLETED:
                return todo.status === TodoStatus.COMPLETED;
            default:
                return true;
        }
    });

    const activeTodos = todos.reduce(function (accum, todo) {
        return isTodoCompleted(todo) ? accum : accum + 1;
    }, 0);

    return (
        <div className="ToDo__container">
            <div className="Todo__creation">
                <input
                    ref={inputRef}
                    className="Todo__input"
                    placeholder="What need to be done?"
                    onKeyDown={onCreateTodo}
                ></input>
            </div>
            <div className="ToDo__list">
                {showTodos.map((todo, index) => {
                    return <TodoItem key={index} todos={todos} todo={todo} dispatch={dispatch} />;
                })}
            </div>
            <div className="Todo__toolbar">
                {todos.length > 0 ? (
                    <input type="checkbox" checked={activeTodos === 0} onChange={onToggleAllTodo} />
                ) : (
                    <div />
                )}
                <div className="Todo__tabs">
                    <button className="Action__btn" onClick={() => setShowing('ALL')}>
                        All
                    </button>
                    <button className="Action__btn" onClick={() => setShowing(TodoStatus.ACTIVE)}>
                        Active
                    </button>
                    <button
                        className="Action__btn"
                        onClick={() => setShowing(TodoStatus.COMPLETED)}
                    >
                        Completed
                    </button>
                </div>
                <button className="Action__btn" onClick={onDeleteAllTodo}>
                    Clear all todos
                </button>
            </div>
        </div>
    );
};

export default ToDoPage;
