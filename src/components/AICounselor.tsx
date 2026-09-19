import React, {
  useState,
  useRef,
  useEffect
} from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";

import { supabase } from "../lib/supabase";


type Props = {
  profile:any;
};



function MessageBubble({
  role,
  text,
}:{
  role:string;
  text:string;
}){


  const animation =
  useRef(
    new Animated.Value(0)
  ).current;



  useEffect(()=>{

    Animated.spring(
      animation,
      {
        toValue:1,
        useNativeDriver:true,
      }
    ).start();


  },[]);



  return (

    <Animated.View

      style={{
        opacity:animation,

        transform:[
          {
            translateY:
            animation.interpolate({
              inputRange:[0,1],
              outputRange:[20,0]
            })
          }
        ]
      }}

    >

      <View

        style={[
          styles.messageWrapper,

          role==="user"
          ?
          styles.userWrapper
          :
          styles.aiWrapper

        ]}

      >


        <View

          style={[
            styles.message,

            role==="user"
            ?
            styles.userMessage
            :
            styles.aiMessage

          ]}

        >

          <Text

            style={[
              styles.messageText,

              role==="user"
              ?
              styles.userText
              :
              styles.aiText

            ]}

          >

            {text}

          </Text>


        </View>


      </View>


    </Animated.View>

  );

}




export default function AICounselor({
  profile
}:Props){


const [loading,setLoading] =
useState(false);



const [question,setQuestion] =
useState("");



const [messages,setMessages] =
useState<any[]>([

{
role:"ai",

text:
"Привет 👋\n\nЯ UniPath AI Counselor.\nТвой персональный помощник по поступлению.\n\nЯ могу помочь с университетами, стипендиями, экзаменами и планом подготовки."
}

]);

useEffect(()=>{

loadHistory();

},[]);


function addMessage(
role:string,
text:string
){

setMessages(prev=>[

...prev,

{
role,
text
}

]);

}

async function saveMessage(
role:string,
text:string
){

console.log(
"SAVE:",
role,
text
);


const {
data:userData
}
=
await supabase.auth.getUser();


if(!userData.user){
console.log("NO USER");
return;
}


const {
error
}
=
await supabase
.from("ai_chat_history")
.insert({

user_id:
userData.user.id,

role:
role,

content:
text

});



if(error){

console.log(
"SAVE ERROR:",
JSON.stringify(error,null,2)
);

}
else{

console.log(
"AI MESSAGE SAVED"
);

}


}


async function loadHistory(){

const {
data:userData
}
=
await supabase.auth.getUser();


if(!userData.user)
return;


const {
data,
error
}
=
await supabase
.from("ai_chat_history")
.select("*")
.eq(
"user_id",
userData.user.id
)
.order(
"created_at",
{
ascending:true
}
);



if(error){

console.log(
"LOAD HISTORY ERROR",
error
);

return;

}



if(data && data.length > 0){

setMessages(

data.map(item=>({

role:item.role,

text:item.content

}))

);

}


}





async function askAI(){


if(
question.trim()===""
)
return;



const userText =
question;



setQuestion("");



addMessage(
"user",
userText
);


await saveMessage(
"user",
userText
);



try{


setLoading(true);



const {
data:userData
}
=
await supabase.auth.getUser();


if(!userData.user){

addMessage(
"ai",
"Пользователь не найден"
);

return;

}




const {
data,
error
}
=
await supabase.functions.invoke(

"unipath-ai",

{

body:{


aiMode:
"profile_analysis",


profile:


profile,


message:

userText


}

}

);






if(error)
throw error;


const aiAnswer =
data?.answer
||
data?.message
||
"Ответ не получен";



addMessage(
"ai",
aiAnswer
);



await saveMessage(
"ai",
aiAnswer
);



}

catch(error:any){


console.log(
error
);


addMessage(

"ai",

error.message
||
"Ошибка AI"

);


}

finally{


setLoading(false);


}



}





return (

<KeyboardAvoidingView

style={styles.container}

behavior={
Platform.OS==="ios"
?
"padding"
:
undefined
}

>



<View
style={styles.header}
>


<View
style={styles.icon}
>

<Text
style={styles.iconText}
>
✦
</Text>

</View>



<View>

<Text
style={styles.title}
>
UniPath AI Counselor
</Text>


<Text
style={styles.status}
>
● AI Online
</Text>


</View>


</View>






<View
style={styles.suggestions}
>


{

[
"Find universities for me",
"How to get scholarship?",
"Improve my profile"
]

.map(item=>(


<Pressable

key={item}

onPress={()=>
setQuestion(item)
}

style={styles.suggestion}

>

<Text
style={styles.suggestionText}
>
{item}
</Text>

</Pressable>


))


}


</View>







<ScrollView

style={styles.chat}

showsVerticalScrollIndicator={false}

>


{

messages.map(

(item,index)=>(

<MessageBubble

key={index}

role={item.role}

text={item.text}

/>

)

)

}





{

loading &&

<View
style={styles.aiWrapper}
>

<View
style={styles.aiMessage}
>

<Text
style={styles.loadingText}
>
● ● ●
</Text>

</View>

</View>

}



</ScrollView>







<View
style={styles.inputBox}
>


<TextInput

value={question}

onChangeText={setQuestion}

placeholder="Ask UniPath AI..."

placeholderTextColor="#9CA79F"

style={styles.input}

/>



<Pressable

onPress={askAI}

style={styles.send}

>


<Text
style={styles.sendText}
>
➤
</Text>


</Pressable>


</View>





</KeyboardAvoidingView>

);

}





const styles =
StyleSheet.create({


container:{

flex:1,

backgroundColor:"#F6F7F1",

padding:20

},



header:{

flexDirection:"row",

alignItems:"center",

backgroundColor:"#FFFFFF",

padding:18,

borderRadius:24,

borderWidth:1,

borderColor:"#DFE5D7"

},



icon:{

width:48,

height:48,

borderRadius:16,

backgroundColor:"#4F6F3C",

alignItems:"center",

justifyContent:"center",

marginRight:12

},



iconText:{

color:"#FFFFFF",

fontSize:24,

fontWeight:"900"

},



title:{

fontSize:19,

fontWeight:"900",

color:"#30362C"

},



status:{

marginTop:4,

fontSize:12,

color:"#648B4A",

fontWeight:"700"

},



suggestions:{

flexDirection:"row",

flexWrap:"wrap",

gap:8,

marginTop:15

},



suggestion:{

backgroundColor:"#DDE6D1",

paddingHorizontal:14,

paddingVertical:9,

borderRadius:20

},



suggestionText:{

color:"#3F5A30",

fontSize:12,

fontWeight:"700"

},



chat:{

flex:1,

marginTop:15

},



messageWrapper:{

marginBottom:12

},



aiWrapper:{

alignItems:"flex-start"

},



userWrapper:{

alignItems:"flex-end"

},



message:{

maxWidth:"85%",

padding:15,

borderRadius:22

},



aiMessage:{

backgroundColor:"#FFFFFF",

borderWidth:1,

borderColor:"#DFE5D7",

borderBottomLeftRadius:5

},



userMessage:{

backgroundColor:"#4F6F3C",

borderBottomRightRadius:5

},



messageText:{

fontSize:14,

lineHeight:22

},



aiText:{

color:"#30362C"

},



userText:{

color:"#FFFFFF"

},



loadingText:{

color:"#648B4A",

fontSize:18

},



inputBox:{

flexDirection:"row",

alignItems:"center",

backgroundColor:"#FFFFFF",

borderRadius:28,

borderWidth:1,

borderColor:"#DFE5D7",

paddingLeft:18,

marginTop:10

},



input:{

flex:1,

height:52,

fontSize:14,

color:"#30362C"

},



send:{

width:44,

height:44,

borderRadius:22,

backgroundColor:"#4F6F3C",

alignItems:"center",

justifyContent:"center",

marginRight:5

},



sendText:{

color:"#FFFFFF",

fontSize:20,

fontWeight:"900"

}



});