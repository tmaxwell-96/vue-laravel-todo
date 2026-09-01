<?php

use App\Models\Todo;
use App\Models\User;

$spaHeaders = ['Referer' => 'http://localhost:5173'];

describe('GET /todos', function () {
    it('returns only the authenticated user\'s todos', function () {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Todo::create(['user_id' => $user->id, 'title' => 'My todo']);
        Todo::create(['user_id' => $other->id, 'title' => 'Other user todo']);

        $response = $this->actingAs($user)->getJson('/api/todos');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['title' => 'My todo'])
            ->assertJsonMissing(['title' => 'Other user todo']);
    });

    it('returns 401 for unauthenticated requests', function () {
        $this->getJson('/api/todos')->assertStatus(401);
    });
});

describe('POST /todos', function () use ($spaHeaders) {
    it('creates a todo for the authenticated user', function () use ($spaHeaders) {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withHeaders($spaHeaders)
            ->postJson('/api/todos', ['title' => 'Buy milk']);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'Buy milk', 'is_completed' => false]);

        $this->assertDatabaseHas('todos', ['title' => 'Buy milk', 'user_id' => $user->id]);
    });

    it('fails when title is missing', function () use ($spaHeaders) {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withHeaders($spaHeaders)
            ->postJson('/api/todos', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    });

    it('returns 401 for unauthenticated requests', function () {
        $this->postJson('/api/todos', ['title' => 'Buy milk'])->assertStatus(401);
    });
});

describe('PATCH /todos/{id}', function () {
    it('toggles is_completed', function () {
        $user = User::factory()->create();
        $todo = Todo::create(['user_id' => $user->id, 'title' => 'Buy milk', 'is_completed' => false]);

        $response = $this->actingAs($user)
            ->patchJson("/api/todos/{$todo->id}", ['is_completed' => true]);

        $response->assertStatus(200)
            ->assertJsonFragment(['is_completed' => true]);

        $this->assertDatabaseHas('todos', ['id' => $todo->id, 'is_completed' => true]);
    });

    it('updates the title', function () {
        $user = User::factory()->create();
        $todo = Todo::create(['user_id' => $user->id, 'title' => 'Old title']);

        $response = $this->actingAs($user)
            ->patchJson("/api/todos/{$todo->id}", ['title' => 'New title']);

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'New title']);
    });

    it('returns 403 when updating another user\'s todo', function () {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $todo = Todo::create(['user_id' => $other->id, 'title' => 'Their todo']);

        $this->actingAs($user)
            ->patchJson("/api/todos/{$todo->id}", ['is_completed' => true])
            ->assertStatus(403);
    });

    it('returns 401 for unauthenticated requests', function () {
        $todo = Todo::create(['user_id' => User::factory()->create()->id, 'title' => 'A todo']);

        $this->patchJson("/api/todos/{$todo->id}", ['is_completed' => true])->assertStatus(401);
    });
});

describe('DELETE /todos/{id}', function () {
    it('deletes the authenticated user\'s todo', function () {
        $user = User::factory()->create();
        $todo = Todo::create(['user_id' => $user->id, 'title' => 'Delete me']);

        $this->actingAs($user)
            ->deleteJson("/api/todos/{$todo->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
    });

    it('returns 403 when deleting another user\'s todo', function () {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $todo = Todo::create(['user_id' => $other->id, 'title' => 'Their todo']);

        $this->actingAs($user)
            ->deleteJson("/api/todos/{$todo->id}")
            ->assertStatus(403);
    });

    it('returns 401 for unauthenticated requests', function () {
        $todo = Todo::create(['user_id' => User::factory()->create()->id, 'title' => 'A todo']);

        $this->deleteJson("/api/todos/{$todo->id}")->assertStatus(401);
    });
});
