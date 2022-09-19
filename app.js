const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndDatabase = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("working");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndDatabase();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDbObjectDirectorToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//ALl Movies List API
app.get("/movies/", async (request, response) => {
  const moviesQuery = `SELECT
            movie_name
        FROM movie
        ORDER BY movie_id;`;

  const result = await database.all(moviesQuery);
  response.send(
    result.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
//One Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieArray = `
    SELECT 
        *
     FROM movie
     WHERE
        movie_id = ${movieId};`;
  const dbResponse = await database.get(movieArray);
  response.send(convertDbObjectToResponseObject(dbResponse));
});
//Post one Movie API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieArray = `
    INSERT INTO 
        movie(director_id, movie_name, lead_actor )
    VALUES 
        (${directorId},'${movieName}','${leadActor}')`;
  await database.run(postMovieArray);
  response.send("Movie Successfully Added");
});
//put One Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovie = `
    UPDATE 
      movie
    SET 
        director_id = ${directorId},
         movie_name = '${movieName}',
         lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};`;
  await database.run(updateMovie);
  response.send("Movie Details Updated");
});
//Delete Movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
        DELETE FROM
            movie
        WHERE 
            movie_id = ${movieId};`;
  await database.run(deleteMovie);
  response.send("Movie Removed");
});

// Directors API
// GET Director list API
app.get("/directors/", async (request, response) => {
  const directorsQuery = `
        SELECT
            *
        FROM 
            director;`;
  const dbResponse = await database.all(directorsQuery);
  response.send(
    dbResponse.map((each) => convertDbObjectDirectorToResponseObject(each))
  );
});
//One Movie API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorArray = `
    SELECT 
        movie_name
     FROM 
        movie
     WHERE
        director_id = '${directorId}';`;
  const result = await database.all(directorArray);
  response.send(result.map((each) => ({ movieName: each.movie_name })));
});

module.exports = app;
