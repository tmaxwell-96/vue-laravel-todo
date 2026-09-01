<?php

use App\Models\User;

$spaHeaders = ['Referer' => 'http://localhost:5173'];

describe('register', function () use ($spaHeaders) {
    it('creates a user and returns them', function () use ($spaHeaders) {
        $response = $this->withHeaders($spaHeaders)->postJson('/api/register', [
            'name' => 'Taylor Maxwell',
            'email' => 'taylor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'name', 'email']);

        $this->assertDatabaseHas('users', ['email' => 'taylor@example.com']);
    });

    it('fails when email is already taken', function () {
        User::factory()->create(['email' => 'taylor@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Taylor Maxwell',
            'email' => 'taylor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('fails when passwords do not match', function () {
        $response = $this->postJson('/api/register', [
            'name' => 'Taylor Maxwell',
            'email' => 'taylor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    });
});

describe('login', function () use ($spaHeaders) {
    it('logs in with correct credentials', function () use ($spaHeaders) {
        User::factory()->create([
            'email' => 'taylor@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->withHeaders($spaHeaders)->postJson('/api/login', [
            'email' => 'taylor@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'name', 'email']);
    });

    it('fails with wrong password', function () {
        User::factory()->create([
            'email' => 'taylor@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'taylor@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });
});

describe('logout', function () use ($spaHeaders) {
    it('logs out an authenticated user', function () use ($spaHeaders) {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->withHeaders($spaHeaders)->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logged out']);
    });

    it('returns 401 for unauthenticated requests', function () {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    });
});

describe('me', function () {
    it('returns the authenticated user', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);
    });

    it('returns 401 for unauthenticated requests', function () {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    });
});
