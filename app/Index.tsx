import { View, Text, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
const fortunes = ["Your destiny unfolds tonight.","A mysterious message changes everything.","Stars align in your favor.","Trust your intuition.","Love is closer than you think."];
export default function Home(){
  const [f,setF] = useState("Tap to reveal your fate...");
  return (
    <View style={s.c}><Text style={s.t}>🔮 Mystic Fate</Text><Text style={s.f}>{f}</Text><Pressable style={s.b} onPress={()=>setF(fortunes[Math.floor(Math.random()*5)])}><Text style={s.bt}>Reveal Fortune</Text></Pressable></View>
  );
}
const s = StyleSheet.create({c:{flex:1,backgroundColor:"#0a0a12",alignItems:"center",justifyContent:"center",padding:24},t:{color:"#d9c7ff",fontSize:32,fontWeight:"bold",marginBottom:40},f:{color:"white",fontSize:20,textAlign:"center",marginBottom:30},b:{backgroundColor:"#7c3aed",paddingHorizontal:24,paddingVertical:12,borderRadius:12},bt:{color:"white",fontSize:18,fontWeight:"bold"}});
