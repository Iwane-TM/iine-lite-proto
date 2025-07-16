console.log("token reading test", process.env.TWITTER_BEARER_TOKEN?.slice(0,10));

//Next.jsのAPIルートのために型情報をインポートしているらしい
import type { NextApiRequest, NextApiResponse } from "next"

//.env.localからトークン取得
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

//メインのAPIハンドラ関数（APIエンドポイントの処理内容）
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
){
    //クエリパラメータからusername取得
    const username = req.query.username as string
    if(!username){
        // 入力がなければ400エラー
        return res.status(400).json({error:'No username provided'})
    }
    try{
        //まずユーザー名からtwitterのユーザーid取得
        const userRes = await fetch(
            'https://api.twitter.com/2/users/by/username/${username}',
            {
                headers:{
                    Authorization: 'Bearer ${BEARER_TOKEN}',//認証トークンをヘッダーに付ける
                },
            }
        )
        
        const userData = await userRes.json()

        //エラーハンドリング
        if(!userData.data?.id){
            return res.status(userRes.status).json({
                error:'User not found',
                twitterResponse: userData,
            });
        }

        const userId = userData.data.id

        //いいね済ツイート取得
        const likedRes = await fetch(
            'https://api.twitter.com/2/users/${userId}/liked_tweets?max_results=10',
            {
                headers:{
                Authorization: 'Bearer ${BEARER_TOKEN}',
                },
            }
        )

        const likedData = await likedRes.json()

        //クライアントに取得したデータを返す

        return res.status(200).json(likedData)
    }catch(error){
        return res.status(500).json({error:'Failed to fetch Twitter data'})
    }
}