const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

const app = express()
app.use(express.json())

let db = null
const importingDBAndServers = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
importingDBAndServers()

const movieNametoPascaleCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}
//API 1
app.get('/movies/', async (req, res) => {
  const getAllMoviesQuery = `SELECT 
                              *
                            FROM
                              movie`
  const moviesArray = await db.all(getAllMoviesQuery)
  res.send(moviesArray.map(movies => movieNametoPascaleCase(movies)))
})
//API 2
app.post('/movies/', async (req, res) => {
  const movieDetails = req.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieDetailsQuery = `INSERT INTO 
                      movie 
                      (director_id, movie_name, lead_actor) 
                      VALUES 
                      (
                         ${directorId},
                        '${movieName}',
                        '${leadActor}'
                      );`
  await db.run(addMovieDetailsQuery)
  res.send('Movie Successfully Added')
})
//API 3
const convertDBObjToResObj = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  }
}
app.get('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  const getMovieQueryById = `SELECT
                          * FROM
                          movie
                          WHERE
                          movie_id = ${movieId}`
  const movie = await db.get(getMovieQueryById)
  res.send(convertDBObjToResObj(movie))
})

//API 4
app.put('/movies/:moviesId/', async (req, res) => {
  const {movieId} = req.params
  const movieDetails = req.body
  const {directorId, movieName, leadActor} = movieDetails

  const updateMovieQuery = `UPDATE
                            movie
                            SET
                            movie_name = '${movieName}',
                            director_id = ${directorId},
                            lead_actor = '${leadActor}',
                            WHERE movie_id = ${movieId},
                            `
  await db.run(updateMovieQuery)
  res.send('Movie Details Updated')
})
//API 5
app.delete('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  const deleteMovieQuery = `DELETE FROM
                            movie
                            WHERE
                            movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  res.send('Movie Removed')
})
const convertDirectorDetailsIntoPascal = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
//API 6
app.get('/directors/', async (req, res) => {
  const getAllDirectorsQuery = `SELECT *
                                FROM director;`
  const movieArray = await db.all(getAllDirectorsQuery)
  res.send(
    movieArray.map(director => convertDirectorDetailsIntoPascal(director)),
  )
})

const convertMovieNameToPascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}
//API 7
app.get('/directors/:directorId/movies/', async (req, res) => {
  const {directorId} = req.params
  const getDirectorQuery = `SELECT movie_name,
                            FROM 
                            director INNER JOIN movie
                            ON director.director_id = movie.director_id
                            WHERE 
                            director.director_id = ${directorId};`
  const movies = await db.all(getDirectorQuery)
  res.send(movies.map(movienames => convertMovieNameToPascalCase(movienames)))
})

module.exports = app
