<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;

class TodoController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $todos = Todo::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return TodoResource::collection($todos);
    }

    public function store(StoreTodoRequest $request): JsonResponse
    {
        $todo = Todo::create([
            ...$request->validated(),
            'user_id' => Auth::id(),
            'is_completed' => false,
        ]);

        return response()->json(new TodoResource($todo), 201);
    }

    public function update(UpdateTodoRequest $request, Todo $todo): JsonResponse
    {
        abort_if($todo->user_id !== Auth::id(), 403);

        $todo->update($request->validated());

        return response()->json(new TodoResource($todo));
    }

    public function destroy(Todo $todo): JsonResponse
    {
        abort_if($todo->user_id !== Auth::id(), 403);

        $todo->delete();

        return response()->json(null, 204);
    }
}
