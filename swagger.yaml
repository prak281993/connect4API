paths:
  /users:
    post:
      summary: Adds a new user
      requestBody:
        content:
          application/json:
            schema:      # Request body contents
              type: object
              properties:
                id:
                  type: integer
                name:
                  type: string
              example:   # Sample object
                id: 10
                name: Jessica Smith
      responses:
        '200':
          description: OK